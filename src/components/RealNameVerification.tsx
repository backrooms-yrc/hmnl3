import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { verifyRealName } from '@/db/api';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RealNameVerificationProps {
  onSuccess?: () => void;
}

export function RealNameVerification({ onSuccess }: RealNameVerificationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    idCard: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: '错误',
        description: '请先登录',
        variant: 'destructive',
      });
      return;
    }

    // 验证表单
    if (!formData.name.trim()) {
      toast({
        title: '错误',
        description: '请输入真实姓名',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.idCard.trim()) {
      toast({
        title: '错误',
        description: '请输入身份证号码',
        variant: 'destructive',
      });
      return;
    }

    // 验证身份证号码格式（18位）
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    if (!idCardRegex.test(formData.idCard)) {
      toast({
        title: '错误',
        description: '请输入正确的18位身份证号码',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await verifyRealName(user.id, formData.name, formData.idCard);

      if (result.success) {
        toast({
          title: '认证成功',
          description: result.message,
        });
        setOpen(false);
        setFormData({ name: '', idCard: '' });
        onSuccess?.();
      } else {
        toast({
          title: '认证失败',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('实名认证错误:', error);
      toast({
        title: '错误',
        description: '认证过程出错，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BadgeCheck className="w-4 h-4" />
          实名认证
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>实名认证</DialogTitle>
          <DialogDescription>
            请输入您的真实姓名和身份证号码进行实名认证。认证后将在个人中心、帖子及聊天中显示已实名标识。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">真实姓名</Label>
            <Input
              id="name"
              placeholder="请输入真实姓名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idCard">身份证号码</Label>
            <Input
              id="idCard"
              placeholder="请输入18位身份证号码"
              value={formData.idCard}
              onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
              disabled={loading}
              maxLength={18}
              required
            />
            <p className="text-xs text-muted-foreground">
              您的身份证信息将被加密存储，仅用于实名认证
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? '认证中...' : '提交认证'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
