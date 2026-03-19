import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { sendSmsCode, verifySmsCode, generateSessionId } from '@/services/smsApi';
import { updateProfile } from '@/db/api';
import { Loader2, Smartphone } from 'lucide-react';

interface PhoneBindDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhone?: string | null;
  onSuccess?: () => void;
}

export function PhoneBindDialog({ open, onOpenChange, currentPhone, onSuccess }: PhoneBindDialogProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile, refreshProfile } = useAuth();

  const isRebind = !!currentPhone;

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      toast({
        title: '错误',
        description: '请输入手机号',
        variant: 'destructive',
      });
      return;
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast({
        title: '错误',
        description: '请输入正确的手机号',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const newSessionId = generateSessionId();
    const result = await sendSmsCode(phone, newSessionId);
    setLoading(false);

    if (result.success) {
      setSessionId(result.sessionId || newSessionId);
      setCodeSent(true);
      setCountdown(60);
      
      // 倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: '发送成功',
        description: '验证码已发送，请查收短信',
      });
    } else {
      toast({
        title: '发送失败',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  // 验证并绑定
  const handleBind = async () => {
    if (!phone || !code) {
      toast({
        title: '错误',
        description: '请输入手机号和验证码',
        variant: 'destructive',
      });
      return;
    }

    if (!profile) {
      toast({
        title: '错误',
        description: '请先登录',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // 先验证验证码
    const verifyResult = await verifySmsCode(phone, code, sessionId);
    
    if (!verifyResult.success) {
      setLoading(false);
      toast({
        title: '验证失败',
        description: verifyResult.message,
        variant: 'destructive',
      });
      return;
    }

    // 验证码正确，更新手机号
    try {
      await updateProfile(profile.id, { phone });
      await refreshProfile();
      
      toast({
        title: isRebind ? '换绑成功' : '绑定成功',
        description: `手机号已${isRebind ? '更换' : '绑定'}为 ${phone}`,
      });
      
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: isRebind ? '换绑失败' : '绑定失败',
        description: error.message || '操作失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhone('');
    setCode('');
    setSessionId('');
    setCodeSent(false);
    setCountdown(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            {isRebind ? '换绑手机号' : '绑定手机号'}
          </DialogTitle>
          <DialogDescription>
            {isRebind 
              ? `当前手机号：${currentPhone}，输入新手机号进行换绑`
              : '绑定手机号后可使用验证码快速登录'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{isRebind ? '新手机号' : '手机号'}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">验证码</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={loading || countdown > 0}
                className="shrink-0"
              >
                {loading && !codeSent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}秒`
                ) : codeSent ? (
                  '重新发送'
                ) : (
                  '发送验证码'
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            取消
          </Button>
          <Button
            onClick={handleBind}
            className="flex-1"
            disabled={loading || !codeSent}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isRebind ? '换绑中...' : '绑定中...'}
              </>
            ) : (
              isRebind ? '确认换绑' : '确认绑定'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
