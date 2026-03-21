import { useState, useEffect, useCallback, useMemo, Component, type ReactNode, type ErrorInfo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDevice } from '@/contexts/DeviceContext';
import { forumAPI, getFullImageUrl } from '@/utils/forum-api';
import { ForumPost } from '@/types/forum';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, User, Calendar, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

class MarkdownErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    if (error.message?.includes('Invalid regular expression') || error.message?.includes('invalid group specifier')) {
      console.error('[MarkdownErrorBoundary] Regex error caught:', error);
      return { hasError: true };
    }
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MarkdownErrorBoundary] Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function ForumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useDevice();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isIOS = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    console.log('[ForumDetail] 设备检测 - UserAgent:', ua, 'isIOS:', isIOSDevice);
    return isIOSDevice;
  }, []);

  const loadPost = useCallback(async () => {
    if (!id) {
      console.error('[ForumDetail] loadPost: ID为空');
      return;
    }
    
    console.log('[ForumDetail] 开始加载帖子 - ID:', id, 'iOS:', isIOS, '重试次数:', retryCount);
    setLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      const data = await forumAPI.getPostById(id);
      const loadTime = performance.now() - startTime;
      
      console.log('[ForumDetail] API响应时间:', loadTime.toFixed(2), 'ms');
      console.log('[ForumDetail] 帖子数据:', {
        title: data?.title,
        hasContent: !!data?.content,
        author: data?.author?.username,
        postNumber: data?.PostNumber
      });
      
      if (!data) {
        throw new Error('帖子数据为空');
      }
      
      if (!data.title && !data.content) {
        console.warn('[ForumDetail] 帖子数据不完整:', data);
      }
      
      setPost(data);
      console.log('[ForumDetail] 帖子加载成功');
    } catch (error: any) {
      console.error('[ForumDetail] 加载失败:', {
        error: error,
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = '无法加载帖子详情';
      
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        errorMessage = '请求超时，请检查网络连接';
      } else if (error.message?.includes('Network') || error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请稍后重试';
      } else if (error.message?.includes('404') || error.response?.status === 404) {
        errorMessage = '帖子不存在或已被删除';
      } else if (error.message?.includes('500') || error.response?.status === 500) {
        errorMessage = '服务器错误，请稍后重试';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: '加载失败',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('[ForumDetail] 加载流程结束');
    }
  }, [id, isIOS, retryCount, toast]);

  useEffect(() => {
    console.log('[ForumDetail] useEffect触发 - id:', id, 'retryCount:', retryCount);
    if (id) {
      loadPost();
    } else {
      console.error('[ForumDetail] 帖子ID无效');
      setError('帖子ID无效');
      setLoading(false);
    }
  }, [id, retryCount, loadPost]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '日期未知';
      }
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '日期格式错误';
    }
  }, []);

  const handleGoBack = useCallback(() => {
    navigate('/forum');
  }, [navigate]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const fallback = target.nextElementSibling;
    if (fallback) {
      fallback.classList.remove('hidden');
    }
  }, []);

  const handleContentImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"%3E%3Crect fill="%23f0f0f0" width="200" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background" style={{ minHeight: isIOS ? '-webkit-fill-available' : '100vh' }}>
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <Button variant="text" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background" style={{ minHeight: isIOS ? '-webkit-fill-available' : '100vh' }}>
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <Button variant="text" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">
              {error || '帖子不存在'}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="outlined" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </Button>
              <Button onClick={handleGoBack}>
                返回论坛
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ minHeight: isIOS ? '-webkit-fill-available' : '100vh' }}>
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button variant="text" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader className={isMobile ? 'p-4' : undefined}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} leading-tight`}>
                {post.title}
              </CardTitle>
              <Badge variant="secondary" className="shrink-0 self-start">
                #{post.PostNumber}
              </Badge>
            </div>
            <CardDescription className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed`}>
              {post.description}
            </CardDescription>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {post.author.avatar ? (
                  <img
                    src={getFullImageUrl(post.author.avatar)}
                    alt={post.author.username}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-muted"
                    onError={handleImageError}
                  />
                ) : null}
                <div className={`${post.author.avatar ? 'hidden' : ''} w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center`}>
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="font-medium">{post.author.username}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className={isMobile ? 'p-4 pt-0' : undefined}>
            {post.content ? (
              <div 
                className="forum-content prose prose-sm max-w-none dark:prose-invert break-words overflow-hidden"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                <MarkdownErrorBoundary
                  fallback={
                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                      {post.content}
                    </div>
                  }
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt, ...props }) => {
                        if (!src) return null;
                        return (
                          <span className="block my-4">
                            <img 
                              src={src} 
                              alt={alt || '图片'} 
                              className="max-w-full h-auto rounded-lg mx-auto"
                              style={{ maxWidth: '100%', height: 'auto' }}
                              loading="lazy"
                              decoding="async"
                              onError={handleContentImageError}
                              {...props}
                            />
                          </span>
                        );
                      },
                      p: ({ children }) => (
                        <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>
                      ),
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                          onClick={() => {
                            console.log('[ForumDetail] 链接点击:', href);
                          }}
                        >
                          {children}
                        </a>
                      ),
                      code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                          return (
                            <code 
                              className="bg-muted px-1.5 py-0.5 rounded text-sm break-words" 
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <pre className="overflow-x-auto -webkit-overflow-scrolling-touch my-4">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      },
                      pre: ({ children }) => (
                        <pre 
                          className="overflow-x-auto bg-muted p-4 rounded-lg my-4"
                          style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                          {children}
                        </pre>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-muted-foreground/20 pl-4 my-4 italic">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </MarkdownErrorBoundary>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无详细内容</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4 sm:mt-6">
          <CardHeader className={isMobile ? 'p-4' : undefined}>
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} flex items-center gap-2`}>
              <MessageSquare className="w-5 h-5" />
              评论区
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-0' : undefined}>
            <div className="text-center py-8 text-muted-foreground">
              <p>评论功能开发中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
