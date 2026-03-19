// 未来7日天气预报Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const areaCn = url.searchParams.get('areaCn')
    const areaCode = url.searchParams.get('areaCode')
    const ip = url.searchParams.get('ip')
    const lng = url.searchParams.get('lng')
    const lat = url.searchParams.get('lat')

    // 构建查询参数
    const params = new URLSearchParams()
    if (areaCn) params.append('areaCn', areaCn)
    if (areaCode) params.append('areaCode', areaCode)
    if (ip) params.append('ip', ip)
    if (lng) params.append('lng', lng)
    if (lat) params.append('lat', lat)

    // 获取API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY')
    if (!apiKey) {
      throw new Error('API密钥未配置')
    }

    // 调用天气API
    const apiUrl = `https://app-883oyd7kz475-api-rY7JZ6jqrV6L-gateway.appmiaoda.com/lundear/weather7d?${params.toString()}`
    console.log('调用7日天气API:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('7日天气API请求失败:', response.status, errorText)
      throw new Error(`7日天气API请求失败: ${response.status}`)
    }

    const data = await response.json()
    console.log('7日天气API响应成功')

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('7日天气预报错误:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : '获取7日天气信息失败',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
