import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { worldviewAPI, getFullImageUrl } from '@/utils/worldview-api';
import { Worldview } from '@/types/worldview';
import LoginDialog from '@/components/worldview/LoginDialog';
import { ArrowLeft, Heart, Eye, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function WorldviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [post, setPost] = useState<Worldview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    if (id) {
      loadPost();
    }
  }, [id]);

  const checkAuth = () => {
    const authenticated = worldviewAPI.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setCurrentUser(worldviewAPI.getCurrentUser());
    }
  };

  const loadPost = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await worldviewAPI.getWorldviewById(id);
      setPost(data);
    } catch (error) {
      console.error('加载帖子失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载帖子详情，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    if (!id) return;

    try {
      await worldviewAPI.toggleLike(id);
      loadPost();
    } catch (error) {
      console.error('点赞失败:', error);
      toast({
        title: '操作失败',
        description: '点赞操作失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const isPostLiked = () => {
    if (!currentUser || !post) return false;
    return post.likingUsers?.some((user) => user.id === currentUser.id) || false;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-10 w-32 mb-6 bg-muted" />
          <Skeleton className="h-12 w-3/4 mb-4 bg-muted" />
          <Skeleton className="h-6 w-full mb-8 bg-muted" />
          <Skeleton className="h-96 w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">帖子不存在</p>
          <Button onClick={() => navigate('/worldview')}>返回列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/worldview')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>

        <article className="bg-card rounded-lg shadow-sm overflow-hidden">
          {post.coverImage && (
            <div className="w-full h-96 overflow-hidden bg-muted">
              <img
                src={getFullImageUrl(post.coverImage) || 'https://via.placeholder.com/800x400?text=No+Image'}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge>{post.category}</Badge>
              {post.tags && post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <p className="text-lg text-muted-foreground mb-6">{post.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6 pb-6 border-b">
              <Link
                to={`/worldview/user/${post.author.id}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                {post.author.avatar ? (
                  <img
                    src={getFullImageUrl(post.author.avatar)}
                    alt={post.author.username}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span>{post.author.username}</span>
              </Link>

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.views} 浏览</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 ${isPostLiked() ? 'text-red-500' : ''}`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${isPostLiked() ? 'fill-current' : ''}`} />
                <span>{post.likingUsers?.length || 0} 点赞</span>
              </Button>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>

            {post.likingUsers && post.likingUsers.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">点赞用户</h3>
                <div className="flex flex-wrap gap-3">
                  {post.likingUsers.map((user) => (
                    <Link
                      key={user.id}
                      to={`/worldview/user/${user.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                    >
                      {user.avatar ? (
                        <img
                          src={getFullImageUrl(user.avatar)}
                          alt={user.username}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="text-sm">{user.username}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onSuccess={checkAuth}
      />
    </div>
  );
}
