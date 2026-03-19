import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDevice } from '@/contexts/DeviceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Radio, Edit, Trash2, MessageSquare, Megaphone, BarChart3, Gift, AlertCircle, Copy, Video } from 'lucide-react';
import { getChannelsByUserId, createNewChannel, updateChannelInfo, deleteUserChannel, updateChannelLiveStatus, getChannelInteractions, createInteraction, updateInteraction, deleteInteraction, uploadChannelLogo } from '@/db/api';
import type { Channel, LiveInteraction } from '@/types/types';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';

export default function LiveManagement() {
  const { user, profile } = useAuth();
  const { isMobile } = useDevice();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [interactions, setInteractions] = useState<LiveInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);

  // 表单状态
  const [channelForm, setChannelForm] = useState({
    name: '',
    description: '',
    stream_id: '',
    cover_image: '',
    channel_url: '',
  });

  const [interactionForm, setInteractionForm] = useState({
    type: 'announcement' as 'announcement' | 'poll' | 'lottery',
    title: '',
    content: {} as any,
  });

  useEffect(() => {
    if (user) {
      loadChannels();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChannel) {
      loadInteractions();
    }
  }, [selectedChannel]);

  const loadChannels = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getChannelsByUserId(user.id);
      setChannels(data);
      if (data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      console.error('加载频道失败:', error);
      toast.error('加载频道失败');
    } finally {
      setLoading(false);
    }
  };

  const loadInteractions = async () => {
    if (!selectedChannel) return;
    try {
      const data = await getChannelInteractions(selectedChannel.id);
      setInteractions(data);
    } catch (error) {
      console.error('加载互动失败:', error);
    }
  };

  const handleCreateChannel = async () => {
    if (!channelForm.name || !channelForm.stream_id) {
      toast.error('请填写频道名称和推流ID');
      return;
    }

    try {
      // 创建频道
            await createNewChannel(channelForm);
            
            toast.success('频道创建成功！');
            setIsCreateDialogOpen(false);
            setChannelForm({ name: '', description: '', stream_id: '', cover_image: '', channel_url: '' });
            loadChannels();
    } catch (error: any) {
      console.error('创建频道失败:', error);
      
      // 处理各种错误情况
      if (error.message?.includes('5个频道')) {
        toast.error('您已达到频道数量上限（5个）');
      } else if (error.message?.includes('policy') || error.code === '42501') {
        toast.error('您没有创建频道的权限，请先申请入驻并等待审核通过');
      } else if (error.message) {
        toast.error(`创建失败：${error.message}`);
      } else {
        toast.error('创建频道失败，请稍后重试');
      }
    }
  };

  const handleUpdateChannel = async () => {
    if (!selectedChannel) return;

    try {
      await updateChannelInfo(selectedChannel.id, channelForm);
      toast.success('频道更新成功');
      setIsEditDialogOpen(false);
      loadChannels();
    } catch (error) {
      console.error('更新频道失败:', error);
      toast.error('更新频道失败');
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('确定要删除这个频道吗？此操作不可恢复。')) return;

    try {
      await deleteUserChannel(channelId);
      toast.success('频道删除成功');
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
      }
      loadChannels();
    } catch (error) {
      console.error('删除频道失败:', error);
      toast.error('删除频道失败');
    }
  };

  const handleToggleLive = async (channelId: string, isLive: boolean) => {
    try {
      await updateChannelLiveStatus(channelId, isLive);
      toast.success(isLive ? '已开始直播' : '已停止直播');
      loadChannels();
    } catch (error) {
      console.error('更新直播状态失败:', error);
      toast.error('更新直播状态失败');
    }
  };

  const handleCreateInteraction = async () => {
    if (!selectedChannel || !interactionForm.title) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      await createInteraction({
        channel_id: selectedChannel.id,
        type: interactionForm.type,
        title: interactionForm.title,
        content: interactionForm.content,
      });
      toast.success('互动创建成功');
      setIsInteractionDialogOpen(false);
      setInteractionForm({ type: 'announcement', title: '', content: {} });
      loadInteractions();
    } catch (error) {
      console.error('创建互动失败:', error);
      toast.error('创建互动失败');
    }
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!confirm('确定要删除这个互动吗？')) return;

    try {
      await deleteInteraction(interactionId);
      toast.success('互动删除成功');
      loadInteractions();
    } catch (error) {
      console.error('删除互动失败:', error);
      toast.error('删除互动失败');
    }
  };

  const handleToggleInteraction = async (interactionId: string, isActive: boolean) => {
    try {
      await updateInteraction(interactionId, { is_active: isActive });
      toast.success(isActive ? '互动已激活' : '互动已停用');
      loadInteractions();
    } catch (error) {
      console.error('更新互动状态失败:', error);
      toast.error('更新互动状态失败');
    }
  };

  // 如果用户未入驻，显示申请入驻界面
  if (!profile?.is_streamer) {
    return (
      <div className="container mx-auto p-4 xl:p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-6 h-6" />
              申请入驻
            </CardTitle>
            <CardDescription>成为入驻主播，开启您的直播之旅</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                您需要先完成入驻认证才能创建频道和开始直播。请先完成实名认证，然后申请入驻。
              </AlertDescription>
            </Alert>
            
            {/* 入驻权益 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">入驻权益</h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                  <Radio className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">专属直播间</p>
                    <p className="text-sm text-muted-foreground">获得独立的直播频道和推流地址</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                  <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">互动功能</p>
                    <p className="text-sm text-muted-foreground">使用公告、投票、抽奖等互动工具</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                  <BarChart3 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">数据统计</p>
                    <p className="text-sm text-muted-foreground">查看观看人数、互动数据等</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 入驻要求 */}
            <div className="space-y-2">
              <h3 className="font-semibold">入驻要求：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>完成实名认证（必须）</li>
                <li>提供直播内容规划</li>
                <li>遵守平台规则和法律法规</li>
                <li>保证直播内容健康、积极向上</li>
              </ul>
            </div>

            {/* 申请按钮 - 兼容is_verified和is_real_verified两个字段 */}
            {(profile?.is_verified || profile?.is_real_verified) ? (
              <div className="space-y-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    请前往个人中心提交入驻申请，管理员审核通过后即可开始直播。
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/profile'}
                >
                  前往个人中心申请入驻
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    您需要先完成实名认证才能申请入驻。请前往个人中心完成实名认证。
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.location.href = '/profile'}
                >
                  前往实名认证
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 xl:p-6">
        <div className="text-center py-12">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className={`mb-6 flex gap-4 ${isMobile ? 'flex-col' : 'flex-row items-center justify-between'}`}>
        <div>
          <h1 className="text-xl font-bold">直播管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理您的频道和直播互动</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={channels.length >= 5}>
              <Plus className="w-4 h-4 mr-2" />
              创建频道 ({channels.length}/5)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建新频道</DialogTitle>
              <DialogDescription>填写频道信息以创建新的直播频道</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">频道名称 *</Label>
                <Input
                  id="name"
                  value={channelForm.name}
                  onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                  placeholder="输入频道名称"
                />
              </div>
              <div>
                <Label htmlFor="stream_id">推流ID *</Label>
                <Input
                  id="stream_id"
                  value={channelForm.stream_id}
                  onChange={(e) => setChannelForm({ ...channelForm, stream_id: e.target.value })}
                  placeholder="输入推流ID"
                />
              </div>
              <div>
                <Label htmlFor="channel_url">频道URL</Label>
                <Input
                  id="channel_url"
                  value={channelForm.channel_url}
                  onChange={(e) => setChannelForm({ ...channelForm, channel_url: e.target.value })}
                  placeholder="输入8-16位字母数字组合，留空自动生成"
                />
              </div>
              <div>
                <Label htmlFor="description">频道简介</Label>
                <Textarea
                  id="description"
                  value={channelForm.description}
                  onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                  placeholder="输入频道简介"
                  rows={3}
                />
              </div>
              <div>
                <Label>频道台标</Label>
                <ImageUpload
                  currentImage={channelForm.cover_image}
                  onUpload={async (file) => {
                    // 创建临时ID用于上传
                    const tempId = `temp_${Date.now()}`;
                    const url = await uploadChannelLogo(tempId, file);
                    setChannelForm({ ...channelForm, cover_image: url });
                    return url;
                  }}
                  onRemove={() => setChannelForm({ ...channelForm, cover_image: '' })}
                  aspectRatio="square"
                  label="上传台标"
                />
              </div>
              <Button onClick={handleCreateChannel} className="w-full">
                创建频道
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {channels.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">还没有频道</h3>
            <p className="text-muted-foreground mb-4">创建您的第一个频道开始直播</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              创建频道
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {/* 左侧：频道列表 */}
          <div className={isMobile ? '' : 'col-span-1'}>
            <Card>
              <CardHeader>
                <CardTitle>我的频道</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedChannel?.id === channel.id
                        ? 'border-primary bg-accent'
                        : 'border-border hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{channel.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {channel.stream_id}
                        </p>
                      </div>
                      {channel.is_live && (
                        <Badge variant="destructive" className="ml-2">
                          <Radio className="w-3 h-3 mr-1" />
                          直播中
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：频道详情和管理 */}
          <div className={isMobile ? '' : 'col-span-2'}>
            {selectedChannel && (
              <Tabs defaultValue="info" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">频道信息</TabsTrigger>
                  <TabsTrigger value="live">直播控制</TabsTrigger>
                  <TabsTrigger value="interactions">互动管理</TabsTrigger>
                </TabsList>

                {/* 频道信息 */}
                <TabsContent value="info">
                  <Card>
                    <CardHeader>
                      <CardTitle>频道信息</CardTitle>
                      <CardDescription>查看和编辑频道基本信息</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>频道名称</Label>
                        <p className="text-sm mt-1">{selectedChannel.name}</p>
                      </div>
                      <div>
                        <Label>推流ID</Label>
                        <p className="text-sm mt-1 font-mono">{selectedChannel.stream_id}</p>
                      </div>
                      <div>
                        <Label>频道简介</Label>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {selectedChannel.description || '暂无简介'}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      {/* RTMP推流地址 */}
                      <div className="space-y-3 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <Label className="text-base font-semibold">RTMP推流地址</Label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={`rtmp://tv.20110208.xyz/live/${selectedChannel.stream_id}`}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(`rtmp://tv.20110208.xyz/live/${selectedChannel.stream_id}`);
                                toast.success('推流地址已复制', {
                                  description: 'RTMP推流地址已复制到剪贴板',
                                });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            使用OBS等推流软件，将此地址设置为推流服务器地址即可开始直播
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1 pt-2">
                            <p className="font-medium">OBS推流设置：</p>
                            <p>• 服务器：rtmp://tv.20110208.xyz/live</p>
                            <p>• 串流密钥：{selectedChannel.stream_id}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      <div className="flex gap-2">
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setChannelForm({
                                  name: selectedChannel.name,
                                  description: selectedChannel.description || '',
                                  stream_id: selectedChannel.stream_id,
                                  cover_image: selectedChannel.cover_image || '',
                                  channel_url: selectedChannel.channel_url || '',
                                })
                              }
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              编辑
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>编辑频道</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-name">频道名称</Label>
                                <Input
                                  id="edit-name"
                                  value={channelForm.name}
                                  onChange={(e) =>
                                    setChannelForm({ ...channelForm, name: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-stream_id">推流ID</Label>
                                <Input
                                  id="edit-stream_id"
                                  value={channelForm.stream_id}
                                  onChange={(e) =>
                                    setChannelForm({ ...channelForm, stream_id: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-description">频道简介</Label>
                                <Textarea
                                  id="edit-description"
                                  value={channelForm.description}
                                  onChange={(e) =>
                                    setChannelForm({ ...channelForm, description: e.target.value })
                                  }
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-channel_url">频道URL</Label>
                                <Input
                                  id="edit-channel_url"
                                  value={channelForm.channel_url}
                                  onChange={(e) =>
                                    setChannelForm({ ...channelForm, channel_url: e.target.value })
                                  }
                                  placeholder="输入8-16位字母数字组合"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-cover_image">封面图URL</Label>
                                <Input
                                  id="edit-cover_image"
                                  value={channelForm.cover_image}
                                  onChange={(e) =>
                                    setChannelForm({ ...channelForm, cover_image: e.target.value })
                                  }
                                />
                              </div>
                              <Button onClick={handleUpdateChannel} className="w-full">
                                保存更改
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteChannel(selectedChannel.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除频道
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 直播控制 */}
                <TabsContent value="live">
                  <Card>
                    <CardHeader>
                      <CardTitle>直播控制</CardTitle>
                      <CardDescription>开启或关闭直播</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">直播状态</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedChannel.is_live ? '当前正在直播' : '当前未直播'}
                          </p>
                        </div>
                        <Switch
                          checked={selectedChannel.is_live}
                          onCheckedChange={(checked) =>
                            handleToggleLive(selectedChannel.id, checked)
                          }
                        />
                      </div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          开启直播后，观众将能够在首页看到您的频道并观看直播内容。
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 互动管理 */}
                <TabsContent value="interactions">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>互动管理</CardTitle>
                          <CardDescription>管理直播间的公告、投票和抽奖</CardDescription>
                        </div>
                        <Dialog
                          open={isInteractionDialogOpen}
                          onOpenChange={setIsInteractionDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              创建互动
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>创建互动</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>互动类型</Label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <Button
                                    variant={
                                      interactionForm.type === 'announcement'
                                        ? 'default'
                                        : 'outline'
                                    }
                                    onClick={() =>
                                      setInteractionForm({ ...interactionForm, type: 'announcement' })
                                    }
                                  >
                                    <Megaphone className="w-4 h-4 mr-1" />
                                    公告
                                  </Button>
                                  <Button
                                    variant={
                                      interactionForm.type === 'poll' ? 'default' : 'outline'
                                    }
                                    onClick={() =>
                                      setInteractionForm({ ...interactionForm, type: 'poll' })
                                    }
                                  >
                                    <BarChart3 className="w-4 h-4 mr-1" />
                                    投票
                                  </Button>
                                  <Button
                                    variant={
                                      interactionForm.type === 'lottery' ? 'default' : 'outline'
                                    }
                                    onClick={() =>
                                      setInteractionForm({ ...interactionForm, type: 'lottery' })
                                    }
                                  >
                                    <Gift className="w-4 h-4 mr-1" />
                                    抽奖
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="interaction-title">标题</Label>
                                <Input
                                  id="interaction-title"
                                  value={interactionForm.title}
                                  onChange={(e) =>
                                    setInteractionForm({ ...interactionForm, title: e.target.value })
                                  }
                                  placeholder="输入标题"
                                />
                              </div>
                              {interactionForm.type === 'announcement' && (
                                <div>
                                  <Label htmlFor="announcement-text">公告内容</Label>
                                  <Textarea
                                    id="announcement-text"
                                    value={interactionForm.content.text || ''}
                                    onChange={(e) =>
                                      setInteractionForm({
                                        ...interactionForm,
                                        content: { text: e.target.value },
                                      })
                                    }
                                    placeholder="输入公告内容"
                                    rows={4}
                                  />
                                </div>
                              )}
                              {interactionForm.type === 'poll' && (
                                <div>
                                  <Label>投票选项（每行一个）</Label>
                                  <Textarea
                                    value={(interactionForm.content.options || []).join('\n')}
                                    onChange={(e) =>
                                      setInteractionForm({
                                        ...interactionForm,
                                        content: {
                                          options: e.target.value.split('\n').filter((o) => o.trim()),
                                          allow_multiple: false,
                                        },
                                      })
                                    }
                                    placeholder="选项1&#10;选项2&#10;选项3"
                                    rows={4}
                                  />
                                </div>
                              )}
                              {interactionForm.type === 'lottery' && (
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor="lottery-prize">奖品</Label>
                                    <Input
                                      id="lottery-prize"
                                      value={interactionForm.content.prize || ''}
                                      onChange={(e) =>
                                        setInteractionForm({
                                          ...interactionForm,
                                          content: {
                                            ...interactionForm.content,
                                            prize: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="输入奖品名称"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="lottery-count">中奖人数</Label>
                                    <Input
                                      id="lottery-count"
                                      type="number"
                                      min="1"
                                      value={interactionForm.content.winner_count || 1}
                                      onChange={(e) =>
                                        setInteractionForm({
                                          ...interactionForm,
                                          content: {
                                            ...interactionForm.content,
                                            winner_count: parseInt(e.target.value) || 1,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="lottery-rules">抽奖规则</Label>
                                    <Textarea
                                      id="lottery-rules"
                                      value={interactionForm.content.rules || ''}
                                      onChange={(e) =>
                                        setInteractionForm({
                                          ...interactionForm,
                                          content: {
                                            ...interactionForm.content,
                                            rules: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="输入抽奖规则"
                                      rows={3}
                                    />
                                  </div>
                                </div>
                              )}
                              <Button onClick={handleCreateInteraction} className="w-full">
                                创建
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {interactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>还没有互动</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {interactions.map((interaction) => (
                            <div
                              key={interaction.id}
                              className="p-4 border rounded-lg flex items-start justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {interaction.type === 'announcement' && (
                                    <Megaphone className="w-4 h-4" />
                                  )}
                                  {interaction.type === 'poll' && <BarChart3 className="w-4 h-4" />}
                                  {interaction.type === 'lottery' && <Gift className="w-4 h-4" />}
                                  <h4 className="font-semibold">{interaction.title}</h4>
                                  <Badge variant={interaction.is_active ? 'default' : 'secondary'}>
                                    {interaction.is_active ? '激活' : '停用'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(interaction.created_at).toLocaleString('zh-CN')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Switch
                                  checked={interaction.is_active}
                                  onCheckedChange={(checked) =>
                                    handleToggleInteraction(interaction.id, checked)
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteInteraction(interaction.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
