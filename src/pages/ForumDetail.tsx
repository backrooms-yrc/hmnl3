import { useState, useEffect } from 'react';
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
import { ArrowLeft, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

export default function ForumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useDevice();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPost();
    } else {
      setError('帖子ID无效');
      setLoading(false);
    }
  }, [id]);

  const loadPost = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await forumAPI.getPostById(id);
      setPost(data);
    } catch (error: any) {
      console.error('加载帖子详情失败:', error);
      setError(error.message || '无法加载帖子详情');
      toast({
        title: '加载失败',
        description: '无法加载帖子详情，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGoBack = () => {
    navigate('/forum');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
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
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
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
            <Button className="mt-4" onClick={handleGoBack}>
              返回论坛
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
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
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
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
              <div className="prose prose-sm max-w-none dark:prose-invert break-words overflow-hidden">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ src, alt, ...props }) => (
                      <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full h-auto rounded-lg"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"%3E%3Crect fill="%23f0f0f0" width="200" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                        }}
                        {...props}
                      />
                    ),
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>,
                  }}
                >
                  {post.content}
                </ReactMarkdown>
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
