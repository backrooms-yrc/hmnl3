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
import { updateRealNameInfo } from '@/db/api';
import { Edit, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UpdateRealNameDialogProps {
  currentName: string;
  currentIdCardLast4: string;
  onSuccess?: () => void;
}

export function UpdateRealNameDialog({ 
  currentName, 
  currentIdCardLast4, 
  onSuccess 
}: UpdateRealNameDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentName,
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

    // 允许用户提交相同的信息（重新验证）
    setLoading(true);

    try {
      const result = await updateRealNameInfo(user.id, formData.name, formData.idCard);

      if (result.success) {
        toast({
          title: '提交成功',
          description: result.message,
        });
        setOpen(false);
        setFormData({ name: currentName, idCard: '' });
        onSuccess?.();
      } else {
        toast({
          title: '提交失败',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('修改实名信息错误:', error);
      toast({
        title: '错误',
        description: '提交过程出错，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="w-3 h-3" />
          修改
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改实名信息</DialogTitle>
          <DialogDescription>
            修改后将重新进行身份验证，并通知管理员审核。您的信息将被加密存储。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-info">当前信息</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              <p>姓名：{currentName}</p>
              <p>身份证号：************{currentIdCardLast4}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">新的真实姓名</Label>
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
            <Label htmlFor="idCard">新的身份证号码</Label>
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
              修改后需要重新验证身份信息
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
              {loading ? '提交中...' : '提交修改'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
