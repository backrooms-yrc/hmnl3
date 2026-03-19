// M3U8特殊播放器Edge Function
// 用于解决自定义m3u8链接的CORS跨域问题
// 返回一个完整的HTML播放器页面
// 支持m3u8链接重定向

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    // 从查询参数获取目标URL
    const url = new URL(req.url)
    const m3u8Url = url.searchParams.get('url')

    if (!m3u8Url) {
      return new Response('缺少url参数', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    console.log('特殊播放器请求:', m3u8Url)

    // 先请求m3u8 URL，获取重定向后的最终URL
    let finalUrl = m3u8Url
    try {
      console.log('检查m3u8链接是否重定向...')
      const testResponse = await fetch(m3u8Url, {
        method: 'HEAD',
        redirect: 'follow', // 自动跟随重定向
      })
      
      // 获取重定向后的最终URL
      finalUrl = testResponse.url
      console.log('最终URL:', finalUrl)
      
      if (finalUrl !== m3u8Url) {
        console.log('检测到重定向:', m3u8Url, '->', finalUrl)
      }
    } catch (error) {
      console.error('检查重定向失败，使用原始URL:', error)
      // 如果检查失败，继续使用原始URL
    }

    // 转义URL中的特殊字符，用于安全地嵌入到JavaScript中
    const escapedUrl = finalUrl
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')

    // 返回HTML播放器页面
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>特殊播放器</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: #000;
      overflow: hidden;
    }
    #video-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    #loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 16px;
      font-family: Arial, sans-serif;
      text-align: center;
      z-index: 10;
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid #fff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    #error {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ff4444;
      font-size: 14px;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      max-width: 80%;
      z-index: 10;
    }
    #debug-info {
      position: absolute;
      bottom: 10px;
      left: 10px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 10px;
      font-family: monospace;
      background: rgba(0, 0, 0, 0.5);
      padding: 5px 10px;
      border-radius: 4px;
      max-width: 90%;
      word-break: break-all;
      z-index: 5;
    }
  </style>
</head>
<body>
  <div id="video-container">
    <video id="video" controls autoplay muted playsinline><\/video>
    <div id="loading">
      <div class="spinner"><\/div>
      <div>正在加载播放器...</div>
    </div>
    <div id="error"><\/div>
    <div id="debug-info">URL: ${escapedUrl}<\/div>
  </div>

  <script>
    (function() {
      const video = document.getElementById('video');
      const loading = document.getElementById('loading');
      const errorDiv = document.getElementById('error');
      const debugInfo = document.getElementById('debug-info');
      const m3u8Url = '${escapedUrl}';

      console.log('特殊播放器初始化');
      console.log('原始URL:', '${m3u8Url.replace(/'/g, "\\'")}');
      console.log('最终URL:', m3u8Url);

      function showError(message) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = '<strong>播放失败<\/strong><br>' + message;
        console.error('播放错误:', message);
      }

      function hideLoading() {
        loading.style.display = 'none';
      }

      function updateDebugInfo(info) {
        debugInfo.textContent = info;
      }

      // 检查浏览器是否原生支持HLS
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('使用原生HLS支持（Safari）');
        updateDebugInfo('播放器: Safari原生HLS | URL: ' + m3u8Url);
        video.src = m3u8Url;
        
        video.addEventListener('loadedmetadata', function() {
          console.log('视频元数据加载完成');
          hideLoading();
        });

        video.addEventListener('error', function(e) {
          console.error('视频错误:', e);
          showError('视频加载失败，请尝试切换其他播放器');
        });

        video.play().catch(function(err) {
          console.log('自动播放被阻止，需要用户交互');
          hideLoading();
        });
      } 
      // 使用HLS.js
      else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        console.log('使用HLS.js播放器');
        updateDebugInfo('播放器: HLS.js | URL: ' + m3u8Url);
        
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          debug: false,
        });

        hls.loadSource(m3u8Url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          console.log('HLS manifest解析成功');
          hideLoading();
          video.play().catch(function(err) {
            console.log('自动播放被阻止');
          });
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
          console.error('HLS错误:', data);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('网络错误，尝试恢复...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('媒体错误，尝试恢复...');
                hls.recoverMediaError();
                break;
              default:
                showError('播放器遇到无法恢复的错误<br>错误类型: ' + data.type + '<br>请尝试切换其他播放器');
                hls.destroy();
                break;
            }
          }
        });
      } else {
        showError('您的浏览器不支持HLS播放<br>请使用Chrome、Safari或Firefox浏览器');
      }

      // 视频事件监听
      video.addEventListener('playing', function() {
        console.log('视频开始播放');
        hideLoading();
      });

      video.addEventListener('waiting', function() {
        console.log('视频缓冲中...');
      });

      video.addEventListener('canplay', function() {
        console.log('视频可以播放');
      });
    })();
  <\/script>
</body>
</html>`

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('特殊播放器错误:', error)
    return new Response(
      `播放器加载失败: ${error.message}`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    )
  }
})
