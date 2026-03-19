import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { worldviewAPI } from '@/utils/worldview-api';
import { Loader2 } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: '请填写完整信息',
        description: '邮箱和密码不能为空',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await worldviewAPI.login(formData);
      toast({
        title: '登录成功',
        description: '欢迎回到幻境界',
      });
      onOpenChange(false);
      setFormData({ email: '', password: '' });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      toast({
        title: '登录失败',
        description: error.response?.data?.message || '请检查邮箱和密码是否正确',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>登录幻境界</DialogTitle>
          <DialogDescription>使用您的幻境界账号登录以发布和管理帖子</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登录
            </Button>
          </DialogFooter>
        </form>

        <div className="text-sm text-muted-foreground text-center mt-4">
          <p>还没有账号？</p>
          <a
            href="https://worldviewplatform.newblock.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            前往幻境界官网注册
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
