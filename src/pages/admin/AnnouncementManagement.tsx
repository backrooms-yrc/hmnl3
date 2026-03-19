import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react';
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/db/api';
import type { Announcement } from '@/types/types';
import { Navigate } from 'react-router-dom';

export default function AnnouncementManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    display_order: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // 检查管理员权限
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('加载公告失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载公告列表',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        image_url: announcement.image_url || '',
        display_order: announcement.display_order,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        image_url: '',
        display_order: announcements.length,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: '请填写必填项',
        description: '标题和内容不能为空',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, formData);
        toast({
          title: '更新成功',
          description: '公告已更新',
        });
      } else {
        await createAnnouncement(formData);
        toast({
          title: '创建成功',
          description: '公告已添加',
        });
      }
      setDialogOpen(false);
      loadAnnouncements();
    } catch (error) {
      console.error('操作失败:', error);
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await updateAnnouncement(announcement.id, { is_active: !announcement.is_active });
      toast({
        title: '更新成功',
        description: `公告已${announcement.is_active ? '禁用' : '启用'}`,
      });
      loadAnnouncements();
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (announcement: Announcement) => {
    if (!confirm(`确定要删除公告"${announcement.title}"吗？`)) {
      return;
    }

    try {
      await deleteAnnouncement(announcement.id);
      toast({
        title: '删除成功',
        description: '公告已删除',
      });
      loadAnnouncements();
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleMoveOrder = async (announcement: Announcement, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? announcement.display_order - 1 : announcement.display_order + 1;
    try {
      await updateAnnouncement(announcement.id, { display_order: newOrder });
      loadAnnouncements();
    } catch (error) {
      console.error('调整顺序失败:', error);
      toast({
        title: '调整失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Megaphone className="w-6 h-6" />
                公告管理
              </CardTitle>
              <CardDescription>管理首页轮播公告</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              添加公告
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无公告，点击"添加公告"开始添加
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className={`p-4 border rounded-lg ${
                    announcement.is_active ? '' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* 图片预览 */}
                    {announcement.image_url && (
                      <div className="w-24 h-24 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={announcement.image_url}
                          alt={announcement.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* 公告信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        显示顺序: {announcement.display_order}
                      </p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleActive(announcement)}
                          title={announcement.is_active ? '禁用' : '启用'}
                        >
                          {announcement.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(announcement)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(announcement)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMoveOrder(announcement, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMoveOrder(announcement, 'down')}
                          disabled={index === announcements.length - 1}
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? '编辑公告' : '添加公告'}
            </DialogTitle>
            <DialogDescription>
              填写公告信息，将在首页轮播显示
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">公告标题 *</Label>
              <Input
                id="title"
                placeholder="请输入公告标题"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">公告内容 *</Label>
              <Textarea
                id="content"
                placeholder="请输入公告内容"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">图片URL</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/image.png"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">显示顺序</Label>
              <Input
                id="display_order"
                type="number"
                placeholder="0"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    display_order: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                数字越小越靠前
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '提交中...' : editingAnnouncement ? '更新' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
