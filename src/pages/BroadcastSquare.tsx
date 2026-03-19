import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicBroadcastPages } from '@/db/api';
import type { BroadcastPage } from '@/types/types';
import { useDevice } from '@/contexts/DeviceContext';
import { Search, Eye, Radio, Plus, Calendar, User } from 'lucide-react';

export default function BroadcastSquare() {
  const { isMobile } = useDevice();
  const [pages, setPages] = useState<BroadcastPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    loadPages();
  }, [currentPage]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data, count } = await getPublicBroadcastPages(currentPage, pageSize, searchQuery);
      setPages(data as BroadcastPage[]);
      setTotalCount(count);
    } catch (error) {
      console.error('加载放送页面失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPages();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-decoration" />
        
        <div className={`${isMobile ? 'px-4' : 'container mx-auto px-6'} py-8 md:py-12 relative z-10`}>
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-3 gap-1">
              <Radio className="w-3 h-3" />
              放送广场
            </Badge>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                放送广场
              </span>
            </h1>
            <p className="text-sm xl:text-base text-muted-foreground">发现精彩的直播间页面，创建属于你的放送空间</p>
          </div>

          <div className={`flex gap-3 mt-6 animate-fade-in ${isMobile ? 'flex-col' : 'flex-row'}`} style={{ animationDelay: '100ms' }}>
            <Input
              placeholder="搜索放送页面..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              variant="filled"
              className={`${isMobile ? 'w-full' : 'w-80'} h-12 rounded-mdui-xl`}
            />
            <Button onClick={handleSearch} className="h-12 px-6 rounded-mdui-xl gap-2">
              <Search className="w-4 h-4" />
              搜索
            </Button>
            <Link to="/broadcast/create">
              <Button variant="tonal" className="h-12 px-6 rounded-mdui-xl gap-2">
                <Plus className="w-4 h-4" />
                创建页面
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '150ms' }}>
            共找到 {totalCount} 个公开页面
          </div>
        </div>
      </section>

      <section className={`${isMobile ? 'px-4' : 'container mx-auto px-6'} py-4`}>
        {loading ? (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <Card variant="filled" className="py-12">
            <CardContent className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-mdui-full bg-muted flex items-center justify-center">
                <Radio className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">暂无公开页面</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? '没有找到匹配的页面，请尝试其他关键词' : '成为第一个创建放送页面的用户吧！'}
              </p>
              <Link to="/broadcast/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  创建页面
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {pages.map((page, index) => (
              <Link key={page.id} to={`/broadcast/${page.id}`}>
                <Card 
                  className="overflow-hidden hover-lift cursor-pointer animate-fade-in group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {page.cover_image ? (
                      <img
                        src={page.cover_image}
                        alt={page.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Radio className="w-16 h-16 text-primary/50" />
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {page.title}
                    </CardTitle>
                    {page.description && (
                      <CardDescription className="line-clamp-2">
                        {page.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {page.profiles && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{page.profiles.username}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(page.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{page.view_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
