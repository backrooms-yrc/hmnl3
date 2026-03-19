import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserBroadcastPages, deleteBroadcastPage, getUserStorageUsed } from '@/db/api';
import type { BroadcastPage } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Eye, Edit, Trash2, Radio, HardDrive, Calendar, Lock, Globe } from 'lucide-react';

const MAX_STORAGE = 5 * 1024 * 1024; // 5MB

export default function MyBroadcastPages() {
  const { user } = useAuth();
  const [pages, setPages] = useState<BroadcastPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    if (user) {
      loadPages();
      loadStorageUsed();
    }
  }, [user]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await getUserBroadcastPages(user!.id);
      setPages(data);
    } catch (error) {
      console.error('加载页面失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageUsed = async () => {
    if (user) {
      const used = await getUserStorageUsed(user.id);
      setStorageUsed(used);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('确定要删除这个页面吗？此操作不可恢复。')) return;

    try {
      await deleteBroadcastPage(pageId);
      setPages(prev => prev.filter(p => p.id !== pageId));
      loadStorageUsed();
    } catch (error) {
      console.error('删除页面失败:', error);
      alert('删除失败，请重试');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const storagePercent = (storageUsed / MAX_STORAGE) * 100;

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-decoration" />
        
        <div className="container mx-auto px-6 py-8 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
            <div>
              <Badge variant="secondary" className="mb-3 gap-1">
                <Radio className="w-3 h-3" />
                我的放送
              </Badge>
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-foreground mb-2">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  我的放送页面
                </span>
              </h1>
              <p className="text-sm xl:text-base text-muted-foreground">管理你的直播间页面</p>
            </div>
            <Link to="/broadcast/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                创建新页面
              </Button>
            </Link>
          </div>

          <Card className="mt-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <HardDrive className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>存储空间</span>
                    <span>{formatFileSize(storageUsed)} / 5 MB</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-mdui-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-6 py-4">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <Card variant="filled" className="py-12">
            <CardContent className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-mdui-full bg-muted flex items-center justify-center">
                <Radio className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">暂无放送页面</p>
              <p className="text-sm text-muted-foreground mb-4">
                创建你的第一个放送页面，展示你的直播间
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page, index) => (
              <Card 
                key={page.id} 
                className="overflow-hidden hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {page.cover_image ? (
                    <img
                      src={page.cover_image}
                      alt={page.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Radio className="w-12 h-12 text-primary/50" />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={page.is_public ? 'success' : 'secondary'} className="gap-1">
                      {page.is_public ? (
                        <>
                          <Globe className="w-3 h-3" />
                          公开
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          私密
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{page.title}</CardTitle>
                  {page.description && (
                    <CardDescription className="line-clamp-2">
                      {page.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(page.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{page.view_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/broadcast/${page.id}`} className="flex-1">
                      <Button variant="outlined" size="sm" className="w-full gap-1">
                        <Eye className="w-4 h-4" />
                        查看
                      </Button>
                    </Link>
                    <Link to={`/broadcast/${page.id}/edit`} className="flex-1">
                      <Button variant="tonal" size="sm" className="w-full gap-1">
                        <Edit className="w-4 h-4" />
                        编辑
                      </Button>
                    </Link>
                    <Button
                      variant="textError"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
