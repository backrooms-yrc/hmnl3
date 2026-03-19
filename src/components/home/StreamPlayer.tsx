import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, RefreshCw, Info } from 'lucide-react';
import Hls from 'hls.js';

interface StreamPlayerProps {
  streamId: string | null;
  channelName: string | null;
  m3u8Url?: string | null; // 自定义m3u8链接
  onClose: () => void;
  hideCloseButton?: boolean;
  hidePlayerInfo?: boolean; // 隐藏播放器简介（沉浸模式使用）
}

export function StreamPlayer({ streamId, channelName, m3u8Url, onClose, hideCloseButton = false, hidePlayerInfo = false }: StreamPlayerProps) {
  const [urlType, setUrlType] = useState<'streams' | 'play' | 'hls' | 'special'>('streams');
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  console.log('StreamPlayer 渲染参数:', { streamId, channelName, m3u8Url });

  // 只有当streamId和m3u8Url都为空时才不渲染
  if (!streamId && !m3u8Url) {
    console.log('StreamPlayer: streamId和m3u8Url都为空，不渲染');
    return null;
  }

  // 获取Supabase配置
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // 如果有自定义m3u8链接，根据播放器类型决定是否使用代理
  const getProxiedUrl = (originalUrl: string) => {
    if (!originalUrl.includes('.m3u8')) return originalUrl;
    
    // 使用Edge Function代理
    const proxyUrl = `${supabaseUrl}/functions/v1/m3u8-proxy?url=${encodeURIComponent(originalUrl)}`;
    console.log('使用代理URL:', proxyUrl);
    return proxyUrl;
  };

  // 根据播放器类型生成URL
  const getUrl = () => {
    if (m3u8Url) {
      // 自定义m3u8链接
      if (urlType === 'hls') {
        // HLS播放器模式：使用代理
        return getProxiedUrl(m3u8Url);
      } else if (urlType === 'special') {
        // 特殊播放器模式：使用Edge Function返回HTML播放器页面
        return `${supabaseUrl}/functions/v1/m3u8-special-player?url=${encodeURIComponent(m3u8Url)}`;
      } else {
        // iframe直链模式：直接使用原始URL
        return m3u8Url;
      }
    } else {
      // 使用streamId
      if (urlType === 'streams') {
        // 播放器1：添加5-10秒延迟参数（避免画面卡顿）
        return `https://tv.20110208.xyz/live/streams/${streamId}.m3u8?delay=8`;
      } else if (urlType === 'play') {
        return `https://tv.20110208.xyz/live/play.html?id=${streamId}`;
      } else {
        // 播放器3：使用代理
        return getProxiedUrl(`https://tv.20110208.xyz/live/streams/${streamId}.m3u8`);
      }
    }
  };

  const url = getUrl();

  console.log('StreamPlayer 使用的URL:', url, 'urlType:', urlType);

  // 是否显示切换播放器按钮
  const showSwitchButton = true; // 总是显示切换按钮

  // 判断是否使用HLS播放器
  const useHlsPlayer = urlType === 'hls';

  console.log('StreamPlayer useHlsPlayer:', useHlsPlayer, 'url:', url);

  // 使用HLS.js加载m3u8流
  useEffect(() => {
    console.log('useEffect 触发 - useHlsPlayer:', useHlsPlayer, 'videoRef.current:', !!videoRef.current);
    
    if (!useHlsPlayer || !videoRef.current) {
      console.log('跳过HLS初始化');
      return;
    }

    const video = videoRef.current;
    console.log('开始初始化HLS播放器，URL:', url);

    // 如果浏览器原生支持HLS（Safari）
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('检测到原生HLS支持（Safari），直接设置video.src');
      video.src = url;
      video.play().catch(err => {
        console.log('原生HLS自动播放被阻止:', err);
      });
    } 
    // 否则使用HLS.js
    else if (Hls.isSupported()) {
      console.log('使用HLS.js播放器');
      
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        debug: true, // 启用调试日志
        xhrSetup: (xhr, url) => {
          // 为代理请求添加认证头
          if (url.includes('m3u8-proxy')) {
            xhr.setRequestHeader('apikey', supabaseAnonKey);
            xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
          }
        },
      });
      
      console.log('HLS实例创建成功，加载源:', url);
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest 解析成功，开始播放');
        video.play().catch(err => {
          console.log('⚠️ 自动播放被阻止，需要用户点击播放:', err);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ HLS 错误:', {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response
        });
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('🔄 网络错误，尝试恢复...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🔄 媒体错误，尝试恢复...');
              hls.recoverMediaError();
              break;
            default:
              console.log('💥 无法恢复的错误，销毁HLS实例');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
      console.log('HLS.js 初始化完成');
    } else {
      console.error('❌ 浏览器不支持HLS播放');
    }

    // 清理函数
    return () => {
      console.log('清理HLS实例');
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, useHlsPlayer, supabaseAnonKey]);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg xl:text-xl">
            {channelName || '直播播放器'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* 切换播放器按钮 */}
            {showSwitchButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (m3u8Url) {
                    // 自定义m3u8：在四种播放器间循环切换
                    setUrlType((prev) => {
                      if (prev === 'streams') return 'special';
                      if (prev === 'special') return 'hls';
                      if (prev === 'hls') return 'streams';
                      return 'streams';
                    });
                  } else {
                    // streamId：在三种模式间循环切换
                    setUrlType((prev) => {
                      if (prev === 'streams') return 'play';
                      if (prev === 'play') return 'hls';
                      return 'streams';
                    });
                  }
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                切换播放器
              </Button>
            )}
            {/* 关闭按钮 */}
            {!hideCloseButton && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* 16:9 比例容器 */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          {useHlsPlayer ? (
            // 使用video标签播放m3u8（HLS播放器）
            <div className="absolute top-0 left-0 w-full h-full bg-black">
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                autoPlay
                muted
                playsInline
                onLoadStart={() => console.log('📹 Video: loadstart')}
                onLoadedMetadata={() => console.log('📹 Video: loadedmetadata')}
                onCanPlay={() => console.log('📹 Video: canplay')}
                onPlay={() => console.log('📹 Video: play')}
                onError={(e) => console.error('📹 Video: error', e)}
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                🎬 HLS播放器
              </div>
            </div>
          ) : (
            // 使用iframe播放
            <iframe
              key={url}
              src={url}
              className="absolute top-0 left-0 w-full h-full border-0"
              title={channelName || '直播播放器'}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
              allow="autoplay; fullscreen"
            />
          )}
        </div>

        {/* 播放器简介 - 沉浸模式下隐藏 */}
        {!hidePlayerInfo && (
          <div className="p-4 space-y-3 bg-muted/30">
            {m3u8Url ? (
              <>
                <Alert className="border-primary/20">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm space-y-2">
                    <div>
                      <strong className="text-primary">自定义播放源：</strong>
                      <span className="text-muted-foreground">此频道使用自定义m3u8播放地址。</span>
                    </div>
                    <div>
                      <strong className="text-primary">播放器1（iframe直链）：</strong>
                      <span className="text-muted-foreground">直接嵌入m3u8链接，兼容性好但可能遇到CORS跨域问题。</span>
                    </div>
                    <div>
                      <strong className="text-primary">播放器2（特殊播放器）：</strong>
                      <span className="text-muted-foreground">使用后端请求后返回HTML播放器页面，解决CORS跨域问题，推荐使用。</span>
                    </div>
                    <div>
                      <strong className="text-primary">播放器3（HLS播放器）：</strong>
                      <span className="text-muted-foreground">使用HLS.js和代理服务器，支持重定向和相对路径。</span>
                    </div>
                    <div className="text-xs text-muted-foreground/80 pt-2 border-t mt-2">
                      <strong>注：</strong>如果你看见了一大串你不认识的英文，请勿退出，那是播放器正在加载！
                    </div>
                  </AlertDescription>
                </Alert>
                <p className="text-xs text-center text-muted-foreground">
                  当前使用：
                  {urlType === 'streams' && '播放器1（iframe直链）'}
                  {urlType === 'special' && '播放器2（特殊播放器）'}
                  {urlType === 'hls' && '播放器3（HLS播放器）'}
                </p>
              </>
            ) : (
              <>
                <Alert className="border-primary/20">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm space-y-2">
                    <div>
                      <strong className="text-primary">播放器1（直链播放器）：</strong>
                      <span className="text-muted-foreground">使用streams接口，直接嵌入播放，默认延迟8秒以避免画面卡顿。</span>
                    </div>
                    <div>
                      <strong className="text-primary">播放器2（智能播放器）：</strong>
                      <span className="text-muted-foreground">内置智能播放器播放，自动实时调控延迟，让您告别卡顿。</span>
                    </div>
                    <div>
                      <strong className="text-primary">播放器3（HLS播放器）：</strong>
                      <span className="text-muted-foreground">使用HLS.js和代理服务器，支持高级功能和错误恢复。</span>
                    </div>
                    <div className="text-xs text-muted-foreground/80 pt-1 border-t">
                      <strong>注：</strong>如果你看见了一大串你不认识的英文，请勿退出，那是播放器正在加载！
                    </div>
                  </AlertDescription>
                </Alert>
                <p className="text-xs text-center text-muted-foreground">
                  当前使用：
                  {urlType === 'streams' && '播放器1（直链播放器）'}
                  {urlType === 'play' && '播放器2（智能播放器）'}
                  {urlType === 'hls' && '播放器3（HLS播放器）'}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
