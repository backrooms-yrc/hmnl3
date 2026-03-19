import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, searchPosts } from '@/db/api';
import type { Post } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, MessageSquare, PenSquare, X, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadPosts();
  }, [debouncedSearch]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = debouncedSearch
        ? await searchPosts(debouncedSearch)
        : await getPosts(50);
      setPosts(data);
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-decoration" />
        
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
            <div className="animate-fade-in">
              <Badge variant="secondary" className="mb-3 gap-1">
                <FileText className="w-3 h-3" />
                讨论广场
              </Badge>
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-foreground mb-2">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  帖子广场
                </span>
              </h1>
              <p className="text-sm xl:text-base text-muted-foreground">分享你的想法，参与热门讨论</p>
            </div>
            <Link to="/create-post" className="animate-scale-in">
              <Button size="lg" className="w-full xl:w-auto rounded-mdui-xl h-12 px-6 gap-2">
                <PenSquare className="w-5 h-5" />
                发布新帖
              </Button>
            </Link>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="搜索帖子标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="filled"
              className="pl-12 pr-12 h-12 rounded-mdui-xl text-base"
            />
            {searchQuery && (
              <Button
                variant="text"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>共 {posts.length} 篇帖子</span>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card variant="filled" className="py-12">
              <CardContent className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-mdui-full bg-muted flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">
                  {searchQuery ? '没有找到相关帖子' : '还没有帖子'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? '试试其他关键词' : '快来发布第一个吧！'}
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post, index) => (
              <Link key={post.id} to={`/post/${post.id}`}>
                <Card 
                  className="overflow-hidden hover-lift cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg xl:text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2 xl:gap-4 text-xs xl:text-sm">
                          {post.author && (
                            <UserAvatar 
                              profile={post.author} 
                              size="sm" 
                              showTitle 
                              showVerified 
                              showRole
                              showRealVerified
                            />
                          )}
                          <span>{formatDate(post.created_at)}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 xl:w-4 xl:h-4" />
                            {post.view_count}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm xl:text-base text-muted-foreground line-clamp-3">
                      {post.content.substring(0, 200)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function User({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
