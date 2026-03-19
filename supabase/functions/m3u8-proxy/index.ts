// M3U8代理Edge Function
// 用于解决CORS问题和处理重定向

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
}

serve(async (req) => {
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // 从查询参数获取目标URL
    const url = new URL(req.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: '缺少url参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('代理请求:', targetUrl)

    // 转发请求到目标服务器，自动跟随重定向
    const targetResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Range': req.headers.get('Range') || '',
      },
      redirect: 'follow', // 自动跟随重定向（最多20次）
    })

    // 获取响应内容
    const contentType = targetResponse.headers.get('Content-Type') || 'application/vnd.apple.mpegurl'
    const body = await targetResponse.arrayBuffer()

    console.log('代理响应:', {
      status: targetResponse.status,
      contentType,
      size: body.byteLength,
      finalUrl: targetResponse.url, // 重定向后的最终URL
      redirected: targetResponse.redirected, // 是否发生了重定向
    })

    // 如果是m3u8文件，需要处理相对路径
    let responseBody = body
    if (contentType.includes('mpegurl') || contentType.includes('m3u8') || targetUrl.endsWith('.m3u8')) {
      const text = new TextDecoder().decode(body)
      
      // 获取基础URL（用于解析相对路径）
      const baseUrl = new URL(targetResponse.url) // 使用重定向后的URL作为基础URL
      const basePath = baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1)
      
      console.log('处理m3u8文件，基础路径:', basePath)
      
      // 将相对路径转换为绝对路径，并通过代理
      const lines = text.split('\n')
      const processedLines = lines.map(line => {
        const trimmedLine = line.trim()
        
        // 跳过注释行和空行
        if (trimmedLine.startsWith('#') || trimmedLine === '') {
          return line
        }
        
        // 处理URL行
        try {
          let absoluteUrl: string
          
          if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
            // 已经是绝对路径
            absoluteUrl = trimmedLine
          } else if (trimmedLine.startsWith('/')) {
            // 绝对路径（相对于域名）
            absoluteUrl = baseUrl.origin + trimmedLine
          } else {
            // 相对路径
            absoluteUrl = basePath + trimmedLine
          }
          
          // 如果是.ts或.m3u8文件，也通过代理
          if (absoluteUrl.endsWith('.ts') || absoluteUrl.endsWith('.m3u8')) {
            const proxyUrl = url.origin + url.pathname + '?url=' + encodeURIComponent(absoluteUrl)
            console.log('代理子资源:', absoluteUrl, '->', proxyUrl)
            return proxyUrl
          }
          
          return absoluteUrl
        } catch (e) {
          console.error('处理URL失败:', trimmedLine, e)
          return line
        }
      })
      
      const processedText = processedLines.join('\n')
      responseBody = new TextEncoder().encode(processedText).buffer
      
      console.log('m3u8文件处理完成，原始行数:', lines.length, '处理后大小:', responseBody.byteLength)
    }

    // 返回带CORS头的响应
    return new Response(responseBody, {
      status: targetResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Length': responseBody.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('代理错误:', error)
    return new Response(
      JSON.stringify({ 
        error: '代理请求失败', 
        message: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
