import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBroadcastPage, incrementBroadcastPageView } from '@/db/api';
import type { BroadcastPage } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Calendar, User, Edit, ArrowLeft, Radio } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function BroadcastView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [page, setPage] = useState<BroadcastPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPage();
    }
  }, [id]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const data = await getBroadcastPage(id!);
      setPage(data as BroadcastPage | null);
      
      if (data) {
        incrementBroadcastPageView(id!);
      }
    } catch (error) {
      console.error('加载页面失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isOwner = user && page && user.id === page.user_id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg mb-2">页面不存在</p>
            <p className="text-sm text-muted-foreground mb-4">
              该页面可能已被删除或设置为私密
            </p>
            <Link to="/broadcast">
              <Button>返回放送广场</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        {page.cover_image && (
          <div 
            className="absolute inset-0 h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${page.cover_image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          </div>
        )}
        
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/broadcast">
              <Button variant="icon" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            
            {isOwner && (
              <Link to={`/broadcast/${page.id}/edit`}>
                <Button variant="tonal" className="gap-2">
                  <Edit className="w-4 h-4" />
                  编辑
                </Button>
              </Link>
            )}
          </div>

          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="gap-1">
                <Radio className="w-3 h-3" />
                放送页面
              </Badge>
              {page.is_public ? (
                <Badge variant="success">公开</Badge>
              ) : (
                <Badge variant="outline">私密</Badge>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {page.title}
            </h1>
            
            {page.description && (
              <p className="text-lg text-muted-foreground mb-4">
                {page.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {page.profiles && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{page.profiles.username}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(page.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{page.view_count} 次浏览</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.html_content, { USE_PROFILES: { html: true } }) }}
              className="prose prose-sm max-w-none p-6 min-h-96"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
