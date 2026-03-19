import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, uploadAvatar, updateAvatarUrl, deleteUserFace, applyForSettlement, deleteUserAccount } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { VerificationCard } from '@/components/verification/VerificationCard';
import { UsernameEditor } from '@/components/UsernameEditor';
import { FaceRegisterDialog } from '@/components/auth/FaceRegisterDialog';
import { PhoneBindDialog } from '@/components/auth/PhoneBindDialog';
import { ApplySettlementDialog } from '@/components/profile/ApplySettlementDialog';
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Hash, Video, Lock, BadgeCheck, ShieldCheck, Sparkles, ScanFace, Smartphone, Trash2, MapPin, RefreshCw } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from 'react-router-dom';
import { getUserLocation } from '@/services/locationService';
import { updateUserLocation } from '@/db/api';

export default function Profile() {
  const { profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [faceRegisterOpen, setFaceRegisterOpen] = useState(false);
  const [phoneBindOpen, setPhoneBindOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [refreshingLocation, setRefreshingLocation] = useState(false);
  const { toast } = useToast();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    return code;
  };

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    generateCaptcha();
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleRefreshLocation = async () => {
    if (!profile) {
      console.error('刷新位置信息失败: profile为空');
      return;
    }

    setRefreshingLocation(true);
    try {
      console.log('手动刷新用户位置信息...');
      console.log('当前用户ID:', profile.id);
      
      const locationInfo = await getUserLocation();
      console.log('getUserLocation返回结果:', locationInfo);
      
      if (locationInfo && locationInfo.city && locationInfo.ip) {
        console.log('获取到位置信息，准备更新到数据库...');
        console.log('城市:', locationInfo.city, 'IP:', locationInfo.ip);
        
        const result = await updateUserLocation(
          profile.id,
          locationInfo.city,
          locationInfo.ip
        );
        
        console.log('updateUserLocation返回结果:', result);
        
        if (result.success) {
          toast({
            title: '位置信息已更新',
            description: `当前城市：${locationInfo.city}`,
          });
          
          // 刷新profile数据
          console.log('开始刷新profile数据...');
          await refreshProfile();
          console.log('profile数据刷新完成');
        } else {
          console.error('更新位置信息失败:', result.message);
          throw new Error(result.message);
        }
      } else {
        console.error('位置信息不完整:', {
          hasLocationInfo: !!locationInfo,
          hasCity: locationInfo?.city,
          hasIp: locationInfo?.ip,
          locationInfo
        });
        toast({
          title: '获取位置信息失败',
          description: '无法获取您的IP地址和城市信息，请检查网络连接',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('刷新位置信息失败:', error);
      console.error('错误详情:', {
        message: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      toast({
        title: '刷新失败',
        description: error instanceof Error ? error.message : '刷新位置信息失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setRefreshingLocation(false);
      console.log('刷新位置信息流程结束');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    setLoading(true);
    try {
      await updateProfile(profile.id, { bio: bio || null });
      await refreshProfile();
      toast({
        title: '更新成功',
        description: '个人资料已更新',
      });
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: '请填写完整',
        description: '请填写所有密码字段',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '新密码和确认密码不一致',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: '密码太短',
        description: '新密码至少需要6个字符',
        variant: 'destructive',
      });
      return;
    }

    // 验证图形验证码
    if (captchaInput.toUpperCase() !== captchaCode) {
      toast({
        title: '验证码错误',
        description: '请输入正确的验证码',
        variant: 'destructive',
      });
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    setPasswordLoading(true);
    try {
      // 先验证旧密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: oldPassword,
      });

      if (signInError) {
        toast({
          title: '旧密码错误',
          description: '请输入正确的旧密码',
          variant: 'destructive',
        });
        return;
      }

      // 更新密码
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: '修改成功',
        description: '密码已更新',
      });

      // 清空表单
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCaptchaInput('');
      generateCaptcha();
    } catch (error) {
      console.error('修改密码失败:', error);
      toast({
        title: '修改失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!profile) return;

    try {
      const avatarUrl = await uploadAvatar(profile.id, file);
      await updateAvatarUrl(profile.id, avatarUrl);
      await refreshProfile();
    } catch (error) {
      throw error;
    }
  };

  // 申请入驻
  const handleApplySettlement = async () => {
    if (!profile) return;

    setSettlementLoading(true);
    try {
      // 发送通知给管理员
      await applyForSettlement(profile.id, profile.username);
      
      await refreshProfile();
      
      toast({
        title: '申请已提交',
        description: '您的入驻申请已提交，请等待管理员审核。审核通过后，您可以在"直播管理"页面创建频道。',
      });
      
      setApplyDialogOpen(false);
    } catch (error) {
      console.error('申请入驻失败:', error);
      toast({
        title: '申请失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSettlementLoading(false);
    }
  };

  // 打开申请入驻对话框
  const openApplyDialog = () => {
    if (!profile) return;

    // 调试日志：查看profile对象的认证字段
    console.log('申请入驻检查 - profile.is_verified:', profile.is_verified);
    console.log('申请入驻检查 - profile.is_real_verified:', profile.is_real_verified);
    console.log('申请入驻检查 - profile完整对象:', profile);

    // 检查是否已实名认证（兼容is_verified和is_real_verified两个字段）
    const isVerified = profile.is_verified || profile.is_real_verified;
    console.log('申请入驻检查 - isVerified结果:', isVerified);
    
    if (!isVerified) {
      toast({
        title: '需要实名认证',
        description: '请先完成实名认证，我们承诺不会泄露您的任何信息！',
        variant: 'destructive',
      });
      return;
    }

    // 检查是否已经是入驻用户
    if (profile.is_streamer) {
      toast({
        title: '您已是入驻用户',
        description: '无需重复申请',
      });
      return;
    }

    setApplyDialogOpen(true);
  };

  // 删除人脸信息
  const handleDeleteFace = async () => {
    if (!profile) return;

    if (!confirm('确定要删除人脸信息吗？删除后将无法使用人脸识别登录。')) {
      return;
    }

    try {
      await deleteUserFace(profile.id);
      await refreshProfile();
      toast({
        title: '删除成功',
        description: '人脸信息已删除',
      });
    } catch (error) {
      console.error('删除人脸失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 注销账号
  const handleDeleteAccount = async () => {
    if (!profile) return;

    setDeleteLoading(true);
    try {
      await deleteUserAccount(profile.id);
      
      toast({
        title: '账号已注销',
        description: '您的账号和所有数据已被永久删除',
      });

      // 登出并跳转到登录页
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('注销账号失败:', error);
      toast({
        title: '注销失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-decoration" />
        
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-3 gap-1">
              <User className="w-3 h-3" />
              个人中心
            </Badge>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                账户设置
              </span>
            </h1>
            <p className="text-sm xl:text-base text-muted-foreground">管理您的个人信息和账户安全</p>
          </div>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

      <div className="grid gap-6">
        {/* 头像上传 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg xl:text-xl">头像设置</CardTitle>
            <CardDescription>上传你的个人头像</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              currentAvatar={profile.avatar_url}
              onUpload={handleAvatarUpload}
            />
          </CardContent>
        </Card>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg xl:text-xl">基本信息</CardTitle>
            <CardDescription>查看你的账户信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <User className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">用户名</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{profile.username}</p>
                    <UsernameEditor currentUsername={profile.username} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">用户ID</p>
                  <p className="font-mono text-sm">{profile.numeric_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">角色与头衔</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {profile.is_super_admin && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                        <ShieldCheck className="w-3 h-3" />
                        超级管理员
                      </span>
                    )}
                    {!profile.is_super_admin && (
                      <p className="font-medium">
                        {profile.role === 'admin' ? '管理员' : '普通用户'}
                      </p>
                    )}
                    {profile.is_verified && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        入驻用户
                      </span>
                    )}
                    {profile.title && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {profile.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 城市信息 */}
              {profile.city && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">所在城市</p>
                    <p className="font-medium">{profile.city}</p>
                    {profile.last_login_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        最后登录：{new Date(profile.last_login_at).toLocaleString('zh-CN')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshLocation}
                    disabled={refreshingLocation}
                    className="shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshingLocation ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              )}

              {/* 手机号管理 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">手机号</p>
                  {profile.phone ? (
                    <div className="mt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-600 text-white">
                          <Smartphone className="w-3 h-3" />
                          已绑定
                        </span>
                      </div>
                      <p className="text-sm font-medium">{profile.phone}</p>
                      <p className="text-xs text-muted-foreground">可使用验证码快速登录</p>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPhoneBindOpen(true)}
                        >
                          换绑手机号
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">未绑定</p>
                      <Button
                        size="sm"
                        onClick={() => setPhoneBindOpen(true)}
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        绑定手机号
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* 人脸识别状态 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <ScanFace className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">人脸识别</p>
                  {profile.face_registered ? (
                    <div className="mt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          <ScanFace className="w-3 h-3" />
                          已注册
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">可使用人脸识别快速登录</p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFaceRegisterOpen(true)}
                        >
                          重新注册
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDeleteFace}
                        >
                          删除人脸
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">未注册</p>
                      <Button
                        size="sm"
                        onClick={() => setFaceRegisterOpen(true)}
                      >
                        <ScanFace className="w-4 h-4 mr-2" />
                        注册人脸
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 实名认证卡片 */}
        <VerificationCard />

        {/* 入驻引导（仅未入驻用户可见） */}
        {!profile.is_streamer && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-lg xl:text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                申请入驻本站
              </CardTitle>
              <CardDescription>
                立即申请入驻HMNL，免费开启您的专属直播间。畅快开播，从未如此简单！
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" />
                    入驻权益
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>创建专属频道，在直播管理查看推流地址</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>开启直播功能，随时随地开播</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>获得"入驻用户"专属标识</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>享受更多平台特权和支持</span>
                    </li>
                  </ul>
                </div>

                {/* 实名认证提示（兼容两个字段） */}
                {!profile.is_verified && !profile.is_real_verified && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>申请入驻需要先完成实名认证，我们承诺不会泄露您的任何信息！</span>
                    </p>
                  </div>
                )}

                <Button
                  onClick={openApplyDialog}
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  立即申请入驻
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 编辑个人简介 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg xl:text-xl">个人简介</CardTitle>
            <CardDescription>介绍一下你自己</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">简介</Label>
                <Textarea
                  id="bio"
                  placeholder="写点什么介绍自己..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                  rows={5}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? '保存中...' : '保存修改'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 修改密码 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg xl:text-xl flex items-center gap-2">
              <Lock className="w-5 h-5" />
              修改密码
            </CardTitle>
            <CardDescription>更改你的账户密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">旧密码</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="请输入旧密码"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="请输入新密码（至少6个字符）"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="captcha">验证码</Label>
                <div className="flex gap-2">
                  <Input
                    id="captcha"
                    type="text"
                    placeholder="请输入验证码"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    disabled={passwordLoading}
                    className="flex-1"
                  />
                  <div 
                    className="flex items-center justify-center w-24 h-10 bg-secondary rounded-md cursor-pointer select-none font-mono text-lg font-bold tracking-wider"
                    onClick={generateCaptcha}
                    title="点击刷新验证码"
                  >
                    {captchaCode}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">点击验证码可刷新</p>
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? '修改中...' : '修改密码'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 账户统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg xl:text-xl">账户统计</CardTitle>
            <CardDescription>你的活动数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-primary">-</p>
                <p className="text-xs xl:text-sm text-muted-foreground mt-1">发布帖子</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-primary">-</p>
                <p className="text-xs xl:text-sm text-muted-foreground mt-1">发表评论</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 text-center col-span-2 xl:col-span-1">
                <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-primary">-</p>
                <p className="text-xs xl:text-sm text-muted-foreground mt-1">获得浏览</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 注销账号 */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg xl:text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              危险操作
            </CardTitle>
            <CardDescription>注销账号后，所有数据将被永久删除且无法恢复</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteAccountOpen(true)}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              注销账号
            </Button>
          </CardContent>
        </Card>
      </div>
      </section>
      
      {/* 人脸注册对话框 */}
      <FaceRegisterDialog
        open={faceRegisterOpen}
        onOpenChange={setFaceRegisterOpen}
        onSuccess={refreshProfile}
      />
      
      {/* 手机号绑定对话框 */}
      <PhoneBindDialog
        open={phoneBindOpen}
        onOpenChange={setPhoneBindOpen}
        currentPhone={profile.phone}
        onSuccess={refreshProfile}
      />
      
      {/* 申请入驻对话框 */}
      <ApplySettlementDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        onSubmit={handleApplySettlement}
        loading={settlementLoading}
      />

      {/* 注销账号对话框 */}
      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
        username={profile.username}
      />
    </div>
  );
}
