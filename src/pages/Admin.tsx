import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDevice } from '@/contexts/DeviceContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAllProfiles, 
  updateUserRole, 
  updateUserTitle, 
  updateUserTitles, 
  updateUserVerified, 
  updateUserStreamer, 
  getPendingReportsCount, 
  updateLiveStatus,
  getAllPopupAnnouncements,
  createPopupAnnouncement,
  updatePopupAnnouncement,
  deletePopupAnnouncement,
  togglePopupAnnouncementStatus
} from '@/db/api';
import type { Profile, PopupAnnouncement } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, Edit2, Check, X, CheckCircle2, Plus, Trash2, AlertTriangle, Search, Eye, Radio, Bot } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RealNameDialog } from '@/components/RealNameDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIModelManagement from './admin/AIModelManagement';

export default function Admin() {
  const { profile } = useAuth();
  const { isMobile } = useDevice();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTitlesId, setEditingTitlesId] = useState<string | null>(null);
  const [editingTitlesValue, setEditingTitlesValue] = useState<string[]>([]);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [realNameDialogOpen, setRealNameDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // 弹窗公告相关状态
  const [popupAnnouncements, setPopupAnnouncements] = useState<PopupAnnouncement[]>([]);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<PopupAnnouncement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 0,
    is_active: true
  });

  // 判断当前用户是否为超级管理员
  const isSuperAdmin = profile?.is_super_admin === true;

  // 辅助函数：更新用户列表并同步过滤结果
  const updateProfilesAndFilter = (updatedProfiles: Profile[]) => {
    setProfiles(updatedProfiles);
    
    // 如果正在搜索，也需要更新过滤后的列表
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = updatedProfiles.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.numeric_id.toString().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.titles?.some(title => title.toLowerCase().includes(query))
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(updatedProfiles);
    }
  };

  // 在useEffect中加载数据
  useEffect(() => {
    loadProfiles();
    loadPendingReportsCount();
    loadPopupAnnouncements();
  }, []);

  // 搜索过滤逻辑
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = profiles.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.numeric_id.toString().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.titles?.some(title => title.toLowerCase().includes(query))
    );
    setFilteredProfiles(filtered);
  }, [searchQuery, profiles]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await getAllProfiles();
      setProfiles(data);
      setFilteredProfiles(data);
    } catch (error) {
      console.error('加载用户列表失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载用户列表',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingReportsCount = async () => {
    try {
      const count = await getPendingReportsCount();
      setPendingReportsCount(count);
    } catch (error) {
      console.error('加载待处理举报数量失败:', error);
    }
  };

  // 加载弹窗公告列表
  const loadPopupAnnouncements = async () => {
    try {
      const data = await getAllPopupAnnouncements();
      setPopupAnnouncements(data);
    } catch (error) {
      console.error('加载弹窗公告失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载弹窗公告列表',
        variant: 'destructive',
      });
    }
  };

  // 打开创建/编辑公告对话框
  const handleOpenAnnouncementDialog = (announcement?: PopupAnnouncement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        is_active: announcement.is_active
      });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: '',
        content: '',
        priority: 0,
        is_active: true
      });
    }
    setAnnouncementDialogOpen(true);
  };

  // 保存公告
  const handleSaveAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      toast({
        title: '请填写完整信息',
        description: '标题和内容不能为空',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingAnnouncement) {
        await updatePopupAnnouncement(editingAnnouncement.id, announcementForm);
        toast({
          title: '更新成功',
          description: '弹窗公告已更新',
        });
      } else {
        await createPopupAnnouncement(announcementForm);
        toast({
          title: '创建成功',
          description: '弹窗公告已创建',
        });
      }
      setAnnouncementDialogOpen(false);
      loadPopupAnnouncements();
    } catch (error) {
      console.error('保存公告失败:', error);
      toast({
        title: '保存失败',
        description: '无法保存弹窗公告',
        variant: 'destructive',
      });
    }
  };

  // 删除公告
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('确定要删除这条公告吗？')) return;

    try {
      await deletePopupAnnouncement(id);
      toast({
        title: '删除成功',
        description: '弹窗公告已删除',
      });
      loadPopupAnnouncements();
    } catch (error) {
      console.error('删除公告失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除弹窗公告',
        variant: 'destructive',
      });
    }
  };

  // 切换公告状态
  const handleToggleAnnouncementStatus = async (id: string, isActive: boolean) => {
    try {
      await togglePopupAnnouncementStatus(id, isActive);
      toast({
        title: '状态已更新',
        description: `公告已${isActive ? '激活' : '停用'}`,
      });
      loadPopupAnnouncements();
    } catch (error) {
      console.error('切换公告状态失败:', error);
      toast({
        title: '操作失败',
        description: '无法切换公告状态',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await updateUserRole(userId, newRole);
      
      // 使用辅助函数同时更新 profiles 和 filteredProfiles
      const updatedProfiles = profiles.map(p => 
        p.id === userId ? { ...p, role: newRole } : p
      );
      updateProfilesAndFilter(updatedProfiles);
      
      toast({
        title: '更新成功',
        description: '用户角色已更新',
      });
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleEditTitles = (userId: string, currentTitles: string[] | null) => {
    setEditingTitlesId(userId);
    // 确保 currentTitles 是一个有效的数组
    setEditingTitlesValue(Array.isArray(currentTitles) ? [...currentTitles] : []);
    setNewTitleInput('');
  };

  const handleAddTitle = () => {
    const trimmedTitle = newTitleInput.trim();
    if (trimmedTitle && trimmedTitle.length <= 10 && !editingTitlesValue.includes(trimmedTitle)) {
      setEditingTitlesValue([...editingTitlesValue, trimmedTitle]);
      setNewTitleInput('');
    } else if (trimmedTitle.length > 10) {
      toast({
        title: '头衔过长',
        description: '头衔最多10个字符',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTitle = (index: number) => {
    setEditingTitlesValue(editingTitlesValue.filter((_, i) => i !== index));
  };

  const handleSaveTitles = async (userId: string) => {
    try {
      // 过滤掉空字符串和过长的头衔
      const validTitles = editingTitlesValue.filter(t => t && t.trim() && t.length <= 10);
      
      await updateUserTitles(userId, validTitles);
      
      // 使用辅助函数同时更新 profiles 和 filteredProfiles
      const updatedProfiles = profiles.map(p => 
        p.id === userId ? { ...p, titles: validTitles } : p
      );
      updateProfilesAndFilter(updatedProfiles);
      
      setEditingTitlesId(null);
      setEditingTitlesValue([]);
      setNewTitleInput('');
      toast({
        title: '更新成功',
        description: '用户头衔已更新',
      });
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTitlesId(null);
    setEditingTitlesValue([]);
    setNewTitleInput('');
  };

  const handleToggleVerified = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStreamer(userId, !currentStatus);
      await loadProfiles();
      toast({
        title: '更新成功',
        description: `已${!currentStatus ? '设置为' : '取消'}入驻用户`,
      });
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleToggleLiveStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateLiveStatus(userId, !currentStatus);
      await loadProfiles();
      toast({
        title: '更新成功',
        description: `已设置为${!currentStatus ? '直播中' : '未在直播'}`,
      });
    } catch (error) {
      console.error('更新直播状态失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 查看实名信息
  const handleViewRealName = (user: Profile) => {
    setSelectedProfile(user);
    setRealNameDialogOpen(true);
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="container max-w-6xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">你没有权限访问此页面</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-2">管理后台</h1>
        <p className="text-sm text-muted-foreground">管理用户和系统设置</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <User className="w-4 h-4 mr-2" />
            用户管理
          </TabsTrigger>
          <TabsTrigger value="models">
            <Bot className="w-4 h-4 mr-2" />
            AI模型管理
          </TabsTrigger>
          <TabsTrigger value="reports">
            <AlertTriangle className="w-4 h-4 mr-2" />
            举报管理
            {pendingReportsCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingReportsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
        <CardHeader>
          <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row items-center justify-between'}`}>
            <div>
              <CardTitle className="text-lg">用户管理</CardTitle>
              <CardDescription>查看和管理所有用户</CardDescription>
            </div>
            <div className={`relative ${isMobile ? 'w-full' : 'w-80'}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索用户名、ID、邮箱或头衔..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted" />
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? '未找到匹配的用户' : '暂无用户'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户信息</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>头衔</TableHead>
                    <TableHead>入驻</TableHead>
                    <TableHead>直播状态</TableHead>
                    {isSuperAdmin && <TableHead>实名认证</TableHead>}
                    <TableHead className="hidden xl:table-cell">注册时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (user.numeric_id) {
                                navigate(`/profile/${user.numeric_id}`);
                              } else {
                                toast({
                                  title: '跳转失败',
                                  description: '用户ID不存在',
                                  variant: 'destructive',
                                });
                              }
                            }}
                            className="rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 w-10 h-10 hover:opacity-80 transition-opacity cursor-pointer"
                            title="查看用户主页"
                          >
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.username} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm">{user.username[0]?.toUpperCase() || 'U'}</span>
                            )}
                          </button>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{user.username}</span>
                            <span className="text-xs text-muted-foreground font-mono">ID: {user.numeric_id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isSuperAdmin ? (
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value as 'user' | 'admin')}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>普通用户</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  <span>管理员</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' ? (
                              <Shield className="w-4 h-4 text-primary" />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">
                              {user.role === 'admin' ? '管理员' : '普通用户'}
                            </span>
                          </div>
                        )}
                        {user.is_super_admin && (
                          <Badge variant="destructive" className="ml-2">超管</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTitlesId === user.id ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {editingTitlesValue.map((title, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {title}
                                  <button
                                    onClick={() => handleRemoveTitle(index)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                value={newTitleInput}
                                onChange={(e) => setNewTitleInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTitle();
                                  }
                                }}
                                placeholder="输入新头衔"
                                className="w-32"
                                maxLength={10}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleAddTitle}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSaveTitles(user.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex flex-wrap gap-1">
                              {user.titles && user.titles.length > 0 ? (
                                user.titles.map((title, index) => (
                                  <Badge key={index} variant="secondary">
                                    {title}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditTitles(user.id, user.titles || [])}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.is_streamer}
                            onCheckedChange={() => handleToggleVerified(user.id, user.is_streamer)}
                          />
                          {user.is_streamer && (
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_streamer ? (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.is_live}
                              onCheckedChange={() => handleToggleLiveStatus(user.id, user.is_live)}
                            />
                            <Badge 
                              variant={user.is_live ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {user.is_live ? (
                                <>
                                  <Radio className="w-3 h-3 mr-1" />
                                  直播中
                                </>
                              ) : (
                                '未在直播'
                              )}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* 兼容is_verified和is_real_verified两个字段 */}
                            {(user.is_verified || user.is_real_verified) ? (
                              <>
                                <Badge variant="default" className="shrink-0">已实名</Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewRealName(user)}
                                  className="h-7 px-2"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  查看
                                </Button>
                              </>
                            ) : (
                              <Badge variant="secondary" className="shrink-0">未实名</Badge>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="hidden xl:table-cell">
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 举报管理快捷入口 */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg xl:text-xl flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                举报管理
              </CardTitle>
              <CardDescription>查看和处理用户举报</CardDescription>
            </div>
            <Link to="/reports">
              <Button>
                查看全部
                {pendingReportsCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs">
                    {pendingReportsCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </CardHeader>
        {pendingReportsCount > 0 && (
          <CardContent>
            <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-600">
                当前有 <span className="font-bold">{pendingReportsCount}</span> 条待处理的举报，请及时处理
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 内容管理快捷入口 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg xl:text-xl">频道管理</CardTitle>
            <CardDescription>管理直播频道列表</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/channels">
              <Button className="w-full">
                进入频道管理
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg xl:text-xl">公告管理</CardTitle>
            <CardDescription>管理首页轮播公告</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/announcements">
              <Button className="w-full">
                进入公告管理
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 弹窗公告管理 */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">弹窗公告管理</CardTitle>
              <CardDescription>管理用户登录时显示的弹窗公告</CardDescription>
            </div>
            <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenAnnouncementDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建公告
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnnouncement ? '编辑弹窗公告' : '创建弹窗公告'}
                  </DialogTitle>
                  <DialogDescription>
                    设置用户登录时显示的弹窗公告内容
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">标题</label>
                    <Input
                      placeholder="请输入公告标题"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">内容</label>
                    <Textarea
                      placeholder="请输入公告内容（支持HTML）"
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">优先级</label>
                    <Input
                      type="number"
                      placeholder="数字越大优先级越高"
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={announcementForm.is_active}
                      onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, is_active: checked })}
                    />
                    <label className="text-sm font-medium">立即激活</label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSaveAnnouncement}>
                    保存
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {popupAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无弹窗公告，点击上方按钮创建
            </div>
          ) : (
            <div className="space-y-4">
              {popupAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                          {announcement.is_active ? '已激活' : '已停用'}
                        </Badge>
                        <Badge variant="outline">优先级: {announcement.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {announcement.content.replace(/<[^>]*>/g, '')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        创建时间: {new Date(announcement.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={announcement.is_active}
                        onCheckedChange={(checked) => handleToggleAnnouncementStatus(announcement.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAnnouncementDialog(announcement)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{profiles.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">管理员</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {profiles.filter(p => p.role === 'admin').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">入驻用户</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {profiles.filter(p => p.is_streamer).length}
            </p>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="models">
          <AIModelManagement />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">举报管理</CardTitle>
                  <CardDescription>查看和处理用户举报</CardDescription>
                </div>
                <Link to="/admin/reports">
                  <Button>
                    <Eye className="w-4 h-4 mr-2" />
                    查看所有举报
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {pendingReportsCount > 0 
                    ? `当前有 ${pendingReportsCount} 条待处理举报` 
                    : '暂无待处理举报'}
                </p>
                <Link to="/admin/reports">
                  <Button variant="outline">
                    前往举报管理页面
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 实名信息查看对话框 */}
      <RealNameDialog
        open={realNameDialogOpen}
        onOpenChange={setRealNameDialogOpen}
        profile={selectedProfile}
      />
    </div>
  );
}
