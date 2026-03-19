import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestM3u8() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [useProxy, setUseProxy] = useState(true);
  const originalUrl = 'http://ahbczp.live.ahct.lv1.vcache.cn:9090/live/program/live/cctv1hd8m/8000000/mnf.m3u8';
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const testUrl = useProxy 
    ? `${supabaseUrl}/functions/v1/m3u8-proxy?url=${encodeURIComponent(originalUrl)}`
    : originalUrl;

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const initPlayer = () => {
    if (!videoRef.current) {
      addLog('❌ video元素不存在');
      return;
    }

    const video = videoRef.current;
    addLog('🎬 开始初始化播放器');
    addLog(`📺 测试URL: ${testUrl}`);

    // 检查浏览器支持
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      addLog('✅ 检测到Safari原生HLS支持');
      video.src = testUrl;
      video.play()
        .then(() => addLog('✅ 播放成功'))
        .catch(err => addLog(`❌ 播放失败: ${err.message}`));
    } else if (Hls.isSupported()) {
      addLog('✅ 使用HLS.js播放器');
      
      const hls = new Hls({
        debug: true,
        enableWorker: true,
        xhrSetup: (xhr, url) => {
          // 为代理请求添加认证头
          if (url.includes('m3u8-proxy')) {
            xhr.setRequestHeader('apikey', supabaseAnonKey);
            xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
            addLog('🔑 添加认证头到代理请求');
          }
        },
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        addLog('📎 媒体已附加');
      });

      hls.on(Hls.Events.MANIFEST_LOADING, () => {
        addLog('📥 开始加载manifest');
      });

      hls.on(Hls.Events.MANIFEST_LOADED, () => {
        addLog('📦 manifest加载完成');
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        addLog('✅ manifest解析成功');
        video.play()
          .then(() => addLog('✅ 开始播放'))
          .catch(err => addLog(`⚠️ 自动播放被阻止: ${err.message}`));
      });

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        addLog('📊 Level加载完成');
      });

      hls.on(Hls.Events.FRAG_LOADING, () => {
        addLog('🔄 正在加载片段');
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        addLog('✅ 片段加载完成');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        addLog(`❌ HLS错误: ${data.type} - ${data.details}`);
        if (data.fatal) {
          addLog(`💥 致命错误: ${data.type}`);
          if (data.response) {
            addLog(`📡 响应: ${JSON.stringify(data.response)}`);
          }
        }
      });

      addLog('🔧 加载源...');
      hls.loadSource(testUrl);
      
      addLog('🔗 附加媒体...');
      hls.attachMedia(video);

      hlsRef.current = hls;
    } else {
      addLog('❌ 浏览器不支持HLS');
    }
  };

  const destroyPlayer = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
      addLog('🗑️ 播放器已销毁');
    }
  };

  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>M3U8播放器测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-x-2">
            <Button onClick={initPlayer}>初始化播放器</Button>
            <Button onClick={destroyPlayer} variant="outline">销毁播放器</Button>
            <Button onClick={() => setLogs([])} variant="outline">清空日志</Button>
            <Button 
              onClick={() => setUseProxy(!useProxy)} 
              variant={useProxy ? "default" : "secondary"}
            >
              {useProxy ? '✅ 使用代理' : '❌ 直连模式'}
            </Button>
          </div>

          <div className="text-sm space-y-1">
            <p><strong>原始URL:</strong></p>
            <p className="break-all font-mono text-xs bg-muted p-2 rounded">{originalUrl}</p>
            <p><strong>当前使用:</strong></p>
            <p className="break-all font-mono text-xs bg-muted p-2 rounded">{testUrl}</p>
            <p className="text-muted-foreground text-xs">
              {useProxy ? '🔄 通过Supabase Edge Function代理，解决CORS问题' : '⚠️ 直连模式可能遇到CORS错误'}
            </p>
          </div>

          <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
            <video
              ref={videoRef}
              className="absolute top-0 left-0 w-full h-full"
              controls
              muted
              playsInline
              onLoadStart={() => addLog('📹 Video: loadstart')}
              onLoadedMetadata={() => addLog('📹 Video: loadedmetadata')}
              onLoadedData={() => addLog('📹 Video: loadeddata')}
              onCanPlay={() => addLog('📹 Video: canplay')}
              onCanPlayThrough={() => addLog('📹 Video: canplaythrough')}
              onPlay={() => addLog('📹 Video: play')}
              onPlaying={() => addLog('📹 Video: playing')}
              onPause={() => addLog('📹 Video: pause')}
              onWaiting={() => addLog('📹 Video: waiting')}
              onError={(e) => {
                const video = e.currentTarget;
                const error = video.error;
                addLog(`📹 Video: error - code: ${error?.code}, message: ${error?.message}`);
              }}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">日志输出：</h3>
            <div className="space-y-1 text-sm font-mono">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">点击"初始化播放器"开始测试</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-xs">{log}</div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
