import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { verifyIdCard, getUserVerificationInfo } from '@/db/api';
import { ShieldCheck, ShieldAlert, Loader2, Info } from 'lucide-react';
import { useEffect } from 'react';

export function VerificationCard() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState<{
    is_verified: boolean;
    real_name: string | null;
    id_card: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    realName: '',
    idCard: '',
  });

  // 加载实名信息
  useEffect(() => {
    if (profile) {
      loadVerificationInfo();
    }
  }, [profile]);

  const loadVerificationInfo = async () => {
    if (!profile) return;
    
    try {
      const info = await getUserVerificationInfo(profile.id, profile.id);
      setVerificationInfo(info);
    } catch (error) {
      console.error('加载实名信息失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      toast({
        title: '错误',
        description: '请先登录',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.realName || !formData.idCard) {
      toast({
        title: '错误',
        description: '请填写完整的实名信息',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await verifyIdCard(
        formData.idCard,
        formData.realName,
        profile.id
      );

      if (result.success) {
        toast({
          title: '实名认证成功',
          description: '您的身份信息已通过验证',
        });
        setDialogOpen(false);
        setFormData({ realName: '', idCard: '' });
        // 重新加载实名信息
        await loadVerificationInfo();
        // 刷新全局profile对象，确保其他组件能获取到最新的认证状态
        await refreshProfile();
      } else {
        toast({
          title: '认证失败',
          description: result.error || '身份信息验证失败，请检查后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('实名认证失败:', error);
      toast({
        title: '认证失败',
        description: error instanceof Error ? error.message : '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModify = () => {
    if (verificationInfo?.real_name) {
      setFormData({
        realName: verificationInfo.real_name,
        idCard: verificationInfo.id_card || '',
      });
    }
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {verificationInfo?.is_verified ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    实名认证
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                    实名认证
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {verificationInfo?.is_verified
                  ? '您已完成实名认证'
                  : '完成实名认证以解锁更多功能'}
              </CardDescription>
            </div>
            <Badge variant={verificationInfo?.is_verified ? 'default' : 'secondary'}>
              {verificationInfo?.is_verified ? '已认证' : '未认证'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationInfo?.is_verified ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">真实姓名</span>
                <span className="text-sm font-medium">
                  {verificationInfo.real_name || '未设置'}
                </span>
              </div>
              {verificationInfo.id_card && profile?.role === 'admin' && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">身份证号</span>
                  <span className="text-sm font-mono">
                    {verificationInfo.id_card}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  我们承诺严格保护您的个人信息，不会泄露给任何第三方。
                  如需修改实名信息，请点击下方按钮。
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleModify}
                className="w-full"
              >
                修改实名信息
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>实名认证后可以：</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>申请入驻开通直播间</li>
                    <li>参与更多互动活动</li>
                    <li>获得更高的账户安全保障</li>
                  </ul>
                  <p className="mt-2">我们承诺不会泄露您的任何信息！</p>
                </div>
              </div>
              <Button
                onClick={() => setDialogOpen(true)}
                className="w-full"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                立即认证
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 实名认证对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {verificationInfo?.is_verified ? '修改实名信息' : '实名认证'}
            </DialogTitle>
            <DialogDescription className="text-left">
              {verificationInfo?.is_verified
                ? '修改实名信息后，将向所有管理员发送通知，请确保信息真实有效。'
                : '请填写真实的身份信息，我们将通过公安部门进行验证。'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realName">真实姓名</Label>
              <Input
                id="realName"
                placeholder="请输入真实姓名"
                value={formData.realName}
                onChange={(e) =>
                  setFormData({ ...formData, realName: e.target.value })
                }
                disabled={loading}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                请输入2-10个中文字符
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idCard">身份证号</Label>
              <Input
                id="idCard"
                placeholder="请输入18位身份证号"
                value={formData.idCard}
                onChange={(e) =>
                  setFormData({ ...formData, idCard: e.target.value.toUpperCase() })
                }
                disabled={loading}
                maxLength={18}
              />
              <p className="text-xs text-muted-foreground">
                请输入18位身份证号码
              </p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                您的身份信息将通过公安部门实名认证系统进行验证，
                我们承诺严格保护您的隐私，不会泄露给任何第三方。
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    认证中...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {verificationInfo?.is_verified ? '确认修改' : '提交认证'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
