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
import { updateProfile } from '@/db/api';
import { Pencil, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UsernameEditorProps {
  currentUsername: string;
  onSuccess?: () => void;
}

export function UsernameEditor({ currentUsername, onSuccess }: UsernameEditorProps) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(currentUsername);

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

    // 验证用户名
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      toast({
        title: '错误',
        description: '用户名不能为空',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedUsername.length < 2) {
      toast({
        title: '错误',
        description: '用户名至少需要2个字符',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedUsername.length > 20) {
      toast({
        title: '错误',
        description: '用户名不能超过20个字符',
        variant: 'destructive',
      });
      return;
    }

    // 验证用户名格式（只允许中文、英文、数字、下划线）
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      toast({
        title: '错误',
        description: '用户名只能包含中文、英文、数字和下划线',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedUsername === currentUsername) {
      toast({
        title: '提示',
        description: '用户名未修改',
      });
      setOpen(false);
      return;
    }

    setLoading(true);

    try {
      await updateProfile(user.id, { username: trimmedUsername });
      
      toast({
        title: '修改成功',
        description: '用户名已更新',
      });
      
      setOpen(false);
      
      // 刷新用户信息
      await refreshProfile();
      
      onSuccess?.();
    } catch (error) {
      console.error('修改用户名失败:', error);
      toast({
        title: '修改失败',
        description: '用户名可能已被使用，请尝试其他用户名',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // 打开对话框时重置为当前用户名
      setUsername(currentUsername);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Pencil className="w-3 h-3" />
          修改
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改用户名</DialogTitle>
          <DialogDescription>
            请输入新的用户名。用户名长度为2-20个字符，只能包含中文、英文、数字和下划线。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">新用户名</Label>
            <Input
              id="username"
              placeholder="请输入新用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              maxLength={20}
              required
            />
            <p className="text-xs text-muted-foreground">
              当前用户名：{currentUsername}
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
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
