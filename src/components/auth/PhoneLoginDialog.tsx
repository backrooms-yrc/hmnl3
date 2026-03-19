import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { sendSmsCode, verifySmsCode, generateSessionId } from '@/services/smsApi';
import { Loader2, Smartphone } from 'lucide-react';

interface PhoneLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PhoneLoginDialog({ open, onOpenChange, onSuccess }: PhoneLoginDialogProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signInWithPhone } = useAuth();

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

  // 验证并登录
  const handleLogin = async () => {
    if (!phone || !code) {
      toast({
        title: '错误',
        description: '请输入手机号和验证码',
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

    // 验证码正确，使用Supabase登录
    const { error } = await signInWithPhone(phone, code);
    setLoading(false);

    if (error) {
      toast({
        title: '登录失败',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '登录成功',
        description: '欢迎回来！',
      });
      onOpenChange(false);
      onSuccess?.();
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
            手机号验证码登录
          </DialogTitle>
          <DialogDescription>
            输入手机号接收验证码，快速登录
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
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
            onClick={handleLogin}
            className="flex-1"
            disabled={loading || !codeSent}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
