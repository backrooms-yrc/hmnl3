import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { worldviewAPI } from '@/utils/worldview-api';
import { ArrowLeft, Loader2, Send } from 'lucide-react';

export default function WorldviewCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    coverImage: '',
    isPublic: true,
  });

  useEffect(() => {
    // 检查是否已登录
    if (!worldviewAPI.isAuthenticated()) {
      toast({
        title: '请先登录',
        description: '发布帖子需要登录账号',
        variant: 'destructive',
      });
      navigate('/worldview');
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.content) {
      toast({
        title: '请填写完整信息',
        description: '标题、描述和内容不能为空',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const newPost = await worldviewAPI.createWorldview(formData);
      toast({
        title: '发布成功',
        description: '您的帖子已成功发布',
      });
      navigate(`/worldview/${newPost.id}`);
    } catch (error: any) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: error.response?.data?.message || '发布帖子失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/worldview')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>发布新帖子</CardTitle>
            <CardDescription>分享您的世界观和创意</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  标题 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="输入帖子标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              {/* 描述 */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  描述 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="简要描述您的帖子内容"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                  rows={3}
                  required
                />
              </div>

              {/* 内容 */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  内容 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="输入帖子内容（支持Markdown格式）"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  disabled={loading}
                  rows={12}
                  required
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  提示：支持Markdown语法，如 **粗体**、*斜体*、# 标题、- 列表、[链接](url)、![图片](url) 等
                </p>
              </div>

              {/* 封面图 */}
              <div className="space-y-2">
                <Label htmlFor="coverImage">封面图片URL（可选）</Label>
                <Input
                  id="coverImage"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  disabled={loading}
                />
                {formData.coverImage && (
                  <div className="mt-2">
                    <img
                      src={formData.coverImage}
                      alt="封面预览"
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 公开设置 */}
              <div className="flex items-center justify-between p-4 rounded-md border">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic">公开发布</Label>
                  <p className="text-sm text-muted-foreground">
                    公开的帖子可以被所有用户浏览
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  disabled={loading}
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/worldview')}
                  disabled={loading}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发布中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      发布帖子
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
