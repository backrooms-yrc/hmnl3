import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Radio, Plus, Pencil, Trash2, Eye, EyeOff, Search, User, UserPlus, Upload, X, Shield } from 'lucide-react';
import { getAllChannelsForAdmin, createChannel, updateChannel, deleteChannel, updateProfile, getAllProfiles, uploadChannelLogo } from '@/db/api';
import type { Channel, Profile } from '@/types/types';
import { Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// 合并的频道类型
interface MergedChannel {
  id: string;
  stream_id: string;
  channel_name: string;
  channel_description: string | null;
  channel_logo: string | null;
  m3u8_url: string | null; // 自定义m3u8链接
  is_active: boolean;
  is_live: boolean;
  source: 'admin' | 'user'; // 频道来源
  user_id?: string; // 用户ID（仅用户频道）
  username?: string; // 用户名（仅用户频道）
}

export default function ChannelManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<MergedChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<MergedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<MergedChannel | null>(null);
  const [formData, setFormData] = useState({
    stream_id: '',
    channel_name: '',
    channel_description: '',
    channel_logo: '',
    m3u8_url: '', // 自定义m3u8链接
    channel_url: '', // 自定义频道URL
    link_to_user: false,
    selected_user_id: '',
  });
  const [userFormData, setUserFormData] = useState({
    user_id: '',
    channel_name: '',
    channel_description: '',
    channel_logo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // 检查管理员权限
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadAllChannels();
    loadUsers();
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChannels(channels);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = channels.filter(
      (channel) =>
        channel.channel_name.toLowerCase().includes(query) ||
        channel.stream_id.toLowerCase().includes(query) ||
        channel.channel_description?.toLowerCase().includes(query) ||
        channel.username?.toLowerCase().includes(query)
    );
    setFilteredChannels(filtered);
  }, [searchQuery, channels]);

  const loadAllChannels = async () => {
    setLoading(true);
    try {
      // 使用统一的getAllChannelsForAdmin函数（已包含管理员频道和用户频道）
      const result = await getAllChannelsForAdmin(1, 1000);

      // 转换为MergedChannel格式
      const allChannels: MergedChannel[] = result.data.map((ch: any) => ({
        id: ch.id,
        stream_id: ch.stream_id,
        channel_name: ch.name,
        channel_description: ch.description,
        channel_logo: ch.cover_image,
        m3u8_url: ch.m3u8_url || null, // 自定义m3u8链接
        is_active: ch.is_active,
        is_live: ch.is_live || false,
        source: ch.source, // 'admin' | 'user'
        user_id: ch.source === 'user' ? ch.user_id : undefined,
        username: ch.source === 'user' ? ch.owner?.username : undefined,
      }));

      setChannels(allChannels);
      setFilteredChannels(allChannels);
    } catch (error) {
      console.error('加载频道失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载频道列表',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await getAllProfiles();
      setUsers(allUsers);
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件大小
    if (file.size > 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '文件大小不能超过1MB',
        variant: 'destructive',
      });
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '只能上传图片文件',
        variant: 'destructive',
      });
      return;
    }

    setLogoFile(file);
    
    // 生成预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = async (userId: string): Promise<string> => {
    if (!logoFile) return '';
    
    setUploading(true);
    try {
      const url = await uploadChannelLogo(userId, logoFile);
      return url;
    } catch (error) {
      console.error('上传台标失败:', error);
      toast({
        title: '上传失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDialog = (channel?: MergedChannel) => {
    if (channel) {
      setEditingChannel(channel);
      setFormData({
        stream_id: channel.stream_id,
        channel_name: channel.channel_name,
        channel_description: channel.channel_description || '',
        channel_logo: channel.channel_logo || '',
        m3u8_url: channel.m3u8_url || '', // 加载m3u8链接
        channel_url: '',
        link_to_user: channel.source === 'user', // 根据频道类型设置
        selected_user_id: channel.source === 'user' ? channel.user_id || '' : '',
      });
    } else {
      setEditingChannel(null);
      setFormData({
        stream_id: '',
        channel_name: '',
        channel_description: '',
        channel_logo: '',
        m3u8_url: '', // 重置m3u8链接
        channel_url: '',
        link_to_user: false,
        selected_user_id: '',
      });
    }
    setLogoFile(null);
    setLogoPreview('');
    setDialogOpen(true);
  };

  const handleOpenUserDialog = () => {
    setUserFormData({
      user_id: '',
      channel_name: '',
      channel_description: '',
      channel_logo: '',
    });
    setLogoFile(null);
    setLogoPreview('');
    setUserSearchQuery('');
    setUserDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.channel_name.trim()) {
      toast({
        title: '请填写必填项',
        description: '频道名称不能为空',
        variant: 'destructive',
      });
      return;
    }

    // 如果关联到用户，必须选择用户
    if (formData.link_to_user && !formData.selected_user_id) {
      toast({
        title: '请选择用户',
        description: '关联到用户时必须选择一个用户',
        variant: 'destructive',
      });
      return;
    }

    // 如果不关联用户，检查推流ID或m3u8链接
    if (!formData.link_to_user) {
      // 如果既没有推流ID也没有m3u8链接，报错
      if (!formData.stream_id.trim() && !formData.m3u8_url.trim()) {
        toast({
          title: '请填写推流ID或m3u8链接',
          description: '推流ID和m3u8链接至少需要填写一个',
          variant: 'destructive',
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      let logoUrl = formData.channel_logo;

      // 如果有上传文件，先上传
      if (logoFile) {
        const userId = formData.link_to_user ? formData.selected_user_id : profile!.id;
        logoUrl = await handleUploadLogo(userId);
      }

      if (editingChannel) {
        // 编辑模式：检查是否更改了关联类型
        const wasAdmin = editingChannel.source === 'admin';
        const isNowUser = formData.link_to_user;

        if (wasAdmin && isNowUser) {
          // 从管理员频道转换为用户频道
          // 1. 删除管理员频道
          await deleteChannel(editingChannel.id);
          // 2. 更新用户信息
          await updateProfile(formData.selected_user_id, {
            is_streamer: true,
            stream_id: formData.stream_id,
            channel_name: formData.channel_name,
            channel_description: formData.channel_description || null,
            channel_logo: logoUrl || null,
          });
          // 3. 调用updateUserStreamer来创建频道记录并生成channel_url
          await updateUserStreamer(formData.selected_user_id, true);
          toast({
            title: '转换成功',
            description: '已将管理员频道转换为用户频道',
          });
        } else if (!wasAdmin && !isNowUser) {
          // 从用户频道转换为管理员频道
          // 1. 清除用户的频道信息
          await updateProfile(editingChannel.user_id!, {
            is_streamer: false,
            stream_id: null,
            channel_name: null,
            channel_description: null,
            channel_logo: null,
          });
          // 2. 创建管理员频道
          await createChannel({
            stream_id: formData.stream_id,
            channel_name: formData.channel_name,
            channel_description: formData.channel_description,
            channel_logo: logoUrl,
            m3u8_url: formData.m3u8_url || null, // 保存m3u8链接
            channel_url: formData.channel_url || undefined, // 自定义频道URL
          });
          toast({
            title: '转换成功',
            description: '已将用户频道转换为管理员频道',
          });
        } else if (wasAdmin && !isNowUser) {
          // 仍然是管理员频道，正常更新
          await updateChannel(editingChannel.id, {
            stream_id: formData.stream_id,
            channel_name: formData.channel_name,
            channel_description: formData.channel_description,
            channel_logo: logoUrl,
            m3u8_url: formData.m3u8_url || null, // 更新m3u8链接
          });
          toast({
            title: '更新成功',
            description: '频道信息已更新',
          });
        } else {
          // 仍然是用户频道，正常更新
          await updateProfile(formData.selected_user_id, {
            channel_name: formData.channel_name,
            channel_description: formData.channel_description || null,
            channel_logo: logoUrl || null,
          });
          toast({
            title: '更新成功',
            description: '频道信息已更新',
          });
        }
      } else {
        // 新增模式
        if (formData.link_to_user) {
          // 关联到用户：更新用户的profiles表
          await updateProfile(formData.selected_user_id, {
            is_streamer: true,
            stream_id: formData.stream_id || formData.selected_user_id, // 使用推流ID或用户ID
            channel_name: formData.channel_name,
            channel_description: formData.channel_description || null,
            channel_logo: logoUrl || null,
          });
          // 调用updateUserStreamer来创建频道记录并生成channel_url
          await updateUserStreamer(formData.selected_user_id, true);
          toast({
            title: '设置成功',
            description: '已为用户设置入驻频道',
          });
        } else {
          // 不关联用户：创建管理员频道
          await createChannel({
            stream_id: formData.stream_id,
            channel_name: formData.channel_name,
            channel_description: formData.channel_description,
            channel_logo: logoUrl,
            m3u8_url: formData.m3u8_url || null, // 保存m3u8链接
            channel_url: formData.channel_url || undefined, // 自定义频道URL
          });
          toast({
            title: '创建成功',
            description: '频道已添加',
          });
        }
      }
      
      setDialogOpen(false);
      loadAllChannels();
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

  const handleUserSubmit = async () => {
    if (!userFormData.user_id) {
      toast({
        title: '请选择用户',
        description: '必须选择一个用户',
        variant: 'destructive',
      });
      return;
    }

    if (!userFormData.channel_name.trim()) {
      toast({
        title: '请填写频道名称',
        description: '频道名称不能为空',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      let logoUrl = userFormData.channel_logo;

      // 如果有上传文件，先上传
      if (logoFile) {
        logoUrl = await handleUploadLogo(userFormData.user_id);
      }

      // 更新用户的profiles表
      await updateProfile(userFormData.user_id, {
        is_streamer: true,
        stream_id: userFormData.user_id, // 使用用户ID作为stream_id
        channel_name: userFormData.channel_name,
        channel_description: userFormData.channel_description || null,
        channel_logo: logoUrl || null,
      });

      // 调用updateUserStreamer来创建频道记录并生成channel_url
      await updateUserStreamer(userFormData.user_id, true);

      toast({
        title: '设置成功',
        description: '已为用户设置入驻频道',
      });
      
      setUserDialogOpen(false);
      loadAllChannels();
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

  const handleToggleActive = async (channel: MergedChannel) => {
    try {
      if (channel.source === 'admin') {
        // 管理员频道：更新channels表
        await updateChannel(channel.id, { is_active: !channel.is_active });
      } else {
        // 用户频道：更新profiles表的is_streamer字段
        await updateProfile(channel.user_id!, { is_streamer: !channel.is_active });
      }
      
      toast({
        title: '更新成功',
        description: `频道已${channel.is_active ? '禁用' : '启用'}`,
      });
      loadAllChannels();
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (channel: MergedChannel) => {
    if (channel.source === 'user') {
      toast({
        title: '无法删除',
        description: '用户频道不能删除，只能禁用',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`确定要删除频道"${channel.channel_name}"吗？`)) {
      return;
    }

    try {
      await deleteChannel(channel.id);
      toast({
        title: '删除成功',
        description: '频道已删除',
      });
      loadAllChannels();
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 切换管理员频道状态
  const handleToggleAdminChannel = async (channel: MergedChannel) => {
    if (channel.source === 'user') {
      toast({
        title: '无法操作',
        description: '用户频道不能设置为管理员频道',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newStatus = channel.source !== 'admin';
      await updateChannel(channel.id, { is_admin_channel: newStatus });
      toast({
        title: '更新成功',
        description: `已${newStatus ? '设置为' : '取消'}管理员频道`,
      });
      loadAllChannels();
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 切换开播状态
  const handleToggleLiveStatus = async (channel: MergedChannel, isLive: boolean) => {
    try {
      if (channel.source === 'admin') {
        // 管理员频道：更新channels表
        await updateChannel(channel.id, { is_live: isLive });
      } else {
        // 用户频道：更新profiles表
        await updateProfile(channel.user_id!, { is_live: isLive });
      }
      
      toast({
        title: '更新成功',
        description: `频道已${isLive ? '开播' : '停播'}`,
      });
      loadAllChannels();
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Radio className="w-6 h-6" />
                频道管理
              </CardTitle>
              <CardDescription>管理所有频道（管理员频道 + 用户频道）</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenUserDialog}>
                <UserPlus className="w-4 h-4 mr-2" />
                为用户设置入驻
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                添加频道
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索频道名称、推流ID、简介或用户名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 统计信息 */}
          <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
            <span>总计: {channels.length} 个频道</span>
            <span>管理员频道: {channels.filter(c => c.source === 'admin').length}</span>
            <span>用户频道: {channels.filter(c => c.source === 'user').length}</span>
            {searchQuery && <span>搜索结果: {filteredChannels.length}</span>}
          </div>

          {/* 频道列表 */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 bg-muted" />
              ))}
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? '没有找到匹配的频道' : '暂无频道'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChannels.map((channel) => (
                <Card 
                  key={channel.id} 
                  className={`p-4 ${channel.source === 'admin' ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* 台标 */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                      {channel.channel_logo ? (
                        <img
                          src={channel.channel_logo}
                          alt={channel.channel_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Radio className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* 管理员频道角标 */}
                      {channel.source === 'admin' && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-bl-lg p-1">
                          <Shield className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* 频道信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-lg truncate">{channel.channel_name}</h3>
                        {channel.source === 'admin' && (
                          <Badge variant="default" className="gap-1">
                            <Shield className="w-3 h-3" />
                            管理员频道
                          </Badge>
                        )}
                        {channel.source === 'user' && (
                          <>
                            <Badge variant="secondary">用户频道</Badge>
                            <Badge variant="outline" className="gap-1">
                              <User className="w-3 h-3" />
                              {channel.username}
                            </Badge>
                          </>
                        )}
                        <Badge variant={channel.is_active ? 'default' : 'secondary'}>
                          {channel.is_active ? '启用' : '禁用'}
                        </Badge>
                        <Badge variant={channel.is_live ? 'destructive' : 'outline'}>
                          {channel.is_live ? '🔴 直播中' : '⚫ 未开播'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        推流ID: <code className="bg-muted px-1 rounded">
                          {channel.stream_id || '(使用自定义m3u8)'}
                        </code>
                      </p>
                      {channel.channel_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {channel.channel_description}
                        </p>
                      )}
                      {/* 开关控制 */}
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={channel.is_live}
                            onCheckedChange={(checked) => handleToggleLiveStatus(channel, checked)}
                          />
                          <span className="text-sm text-muted-foreground">开播状态</span>
                        </div>
                        {channel.source === 'admin' && (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={true}
                              onCheckedChange={() => handleToggleAdminChannel(channel)}
                            />
                            <span className="text-sm text-muted-foreground">管理员频道</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenDialog(channel)}
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleActive(channel)}
                        title={channel.is_active ? '禁用' : '启用'}
                      >
                        {channel.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      {channel.source === 'admin' && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(channel)}
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑频道对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingChannel ? '编辑频道' : '添加频道'}</DialogTitle>
            <DialogDescription>
              {editingChannel 
                ? '修改频道信息，可以更改频道类型（管理员频道 ↔ 用户频道）' 
                : '添加新的频道或关联到用户'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* 关联到用户选项 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="link_to_user">关联到用户</Label>
                <p className="text-sm text-muted-foreground">
                  {editingChannel 
                    ? '切换频道类型：管理员频道 ↔ 用户频道' 
                    : '将此频道关联到现有用户，更新用户的频道信息'}
                </p>
              </div>
              <Switch
                id="link_to_user"
                checked={formData.link_to_user}
                onCheckedChange={(checked) => setFormData({ ...formData, link_to_user: checked })}
              />
            </div>

            {/* 用户选择器（仅关联到用户时显示） */}
            {formData.link_to_user && (
              <div>
                <Label htmlFor="selected_user">选择用户 *</Label>
                <Select
                  value={formData.selected_user_id}
                  onValueChange={(value) => setFormData({ ...formData, selected_user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个用户" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingUsers ? (
                      <SelectItem value="loading" disabled>加载中...</SelectItem>
                    ) : users.filter(u => !u.is_streamer).length === 0 ? (
                      <SelectItem value="empty" disabled>没有可用的用户</SelectItem>
                    ) : (
                      users
                        .filter(u => !u.is_streamer)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username} ({user.email})
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  只显示未入驻的用户
                </p>
              </div>
            )}

            {/* 推流ID（仅不关联用户时显示） */}
            {!formData.link_to_user && (
              <div>
                <Label htmlFor="stream_id">
                  推流ID {formData.m3u8_url.trim() ? '(可选)' : '*'}
                </Label>
                <Input
                  id="stream_id"
                  value={formData.stream_id}
                  onChange={(e) => setFormData({ ...formData, stream_id: e.target.value })}
                  placeholder={formData.m3u8_url.trim() ? '使用自定义m3u8链接时可不填' : '例如: test123'}
                  disabled={!!editingChannel}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {editingChannel 
                    ? '推流ID不可修改' 
                    : formData.m3u8_url.trim() 
                      ? '使用自定义m3u8链接时，推流ID可以留空' 
                      : '用于生成推流地址，必填'}
                </p>
              </div>
            )}

            {/* 频道名称 */}
            <div>
              <Label htmlFor="channel_name">频道名称 *</Label>
              <Input
                id="channel_name"
                value={formData.channel_name}
                onChange={(e) => setFormData({ ...formData, channel_name: e.target.value })}
                placeholder="例如: 测试频道"
              />
            </div>

            {/* 频道简介 */}
            <div>
              <Label htmlFor="channel_description">频道简介</Label>
              <Textarea
                id="channel_description"
                value={formData.channel_description}
                onChange={(e) => setFormData({ ...formData, channel_description: e.target.value })}
                placeholder="简要介绍频道内容..."
                rows={3}
              />
            </div>

            {/* 自定义m3u8链接 */}
            <div>
              <Label htmlFor="m3u8_url">自定义m3u8直播流链接（可选）</Label>
              <Input
                id="m3u8_url"
                value={formData.m3u8_url}
                onChange={(e) => setFormData({ ...formData, m3u8_url: e.target.value })}
                placeholder="例如: https://example.com/live/stream.m3u8"
                type="url"
              />
              <p className="text-sm text-muted-foreground mt-1">
                如果设置，播放器将优先使用此链接，而不是默认的推流地址
              </p>
            </div>

            {/* 自定义频道URL */}
            {!formData.link_to_user && (
              <div>
                <Label htmlFor="channel_url">频道URL（可选，留空则随机生成）</Label>
                <Input
                  id="channel_url"
                  value={formData.channel_url}
                  onChange={(e) => setFormData({ ...formData, channel_url: e.target.value })}
                  placeholder="例如: my-awesome-channel"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  3-20个字符，仅支持小写字母、数字、下划线和连字符
                </p>
              </div>
            )}

            {/* 台标上传 */}
            <div>
              <Label>台标</Label>
              <div className="space-y-2">
                {/* 文件上传 */}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoFile ? logoFile.name : '选择图片文件'}
                  </Button>
                  {logoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* 预览 */}
                {(logoPreview || formData.channel_logo) && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted border">
                    <img
                      src={logoPreview || formData.channel_logo}
                      alt="台标预览"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 或者输入URL */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      或输入URL
                    </span>
                  </div>
                </div>
                <Input
                  id="channel_logo"
                  value={formData.channel_logo}
                  onChange={(e) => setFormData({ ...formData, channel_logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-muted-foreground">
                  支持上传图片（最大1MB）或输入图片URL
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || uploading}>
              {uploading ? '上传中...' : submitting ? '提交中...' : editingChannel ? '更新' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 为用户设置入驻对话框 */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>为用户设置入驻</DialogTitle>
            <DialogDescription>
              为未申请入驻的用户手动设置频道信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* 用户搜索和选择 */}
            <div>
              <Label htmlFor="user_select">选择用户 *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="搜索用户名或邮箱..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
                <Select
                  value={userFormData.user_id}
                  onValueChange={(value) => {
                    const selectedUser = users.find(u => u.id === value);
                    setUserFormData({
                      ...userFormData,
                      user_id: value,
                      channel_name: selectedUser?.username || '',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个用户" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingUsers ? (
                      <SelectItem value="loading" disabled>加载中...</SelectItem>
                    ) : users
                        .filter(u => !u.is_streamer)
                        .filter(u => 
                          !userSearchQuery || 
                          u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                        ).length === 0 ? (
                      <SelectItem value="empty" disabled>
                        {userSearchQuery ? '没有匹配的用户' : '没有可用的用户'}
                      </SelectItem>
                    ) : (
                      users
                        .filter(u => !u.is_streamer)
                        .filter(u => 
                          !userSearchQuery || 
                          u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                        )
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <span>{user.username}</span>
                              {user.email && (
                                <span className="text-muted-foreground text-sm">
                                  ({user.email})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  只显示未入驻的用户，系统将自动为用户生成推流ID
                </p>
              </div>
            </div>

            {/* 频道名称 */}
            <div>
              <Label htmlFor="user_channel_name">频道名称 *</Label>
              <Input
                id="user_channel_name"
                value={userFormData.channel_name}
                onChange={(e) => setUserFormData({ ...userFormData, channel_name: e.target.value })}
                placeholder="例如: 测试频道"
              />
            </div>

            {/* 频道简介 */}
            <div>
              <Label htmlFor="user_channel_description">频道简介</Label>
              <Textarea
                id="user_channel_description"
                value={userFormData.channel_description}
                onChange={(e) => setUserFormData({ ...userFormData, channel_description: e.target.value })}
                placeholder="简要介绍频道内容..."
                rows={3}
              />
            </div>

            {/* 台标上传 */}
            <div>
              <Label>台标</Label>
              <div className="space-y-2">
                {/* 文件上传 */}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="user-logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('user-logo-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoFile ? logoFile.name : '选择图片文件'}
                  </Button>
                  {logoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* 预览 */}
                {(logoPreview || userFormData.channel_logo) && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted border">
                    <img
                      src={logoPreview || userFormData.channel_logo}
                      alt="台标预览"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 或者输入URL */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      或输入URL
                    </span>
                  </div>
                </div>
                <Input
                  id="user_channel_logo"
                  value={userFormData.channel_logo}
                  onChange={(e) => setUserFormData({ ...userFormData, channel_logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-muted-foreground">
                  支持上传图片（最大1MB）或输入图片URL
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUserSubmit} disabled={submitting || uploading}>
              {uploading ? '上传中...' : submitting ? '提交中...' : '设置入驻'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
