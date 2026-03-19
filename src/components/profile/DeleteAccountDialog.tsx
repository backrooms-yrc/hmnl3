import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  username: string;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  username,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = async () => {
    if (confirmText === username) {
      await onConfirm();
      setConfirmText('');
    }
  };

  const handleCancel = () => {
    setConfirmText('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            注销账号
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">此操作不可撤销！</p>
                    <p className="text-sm">注销账号后，以下数据将被永久删除：</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>所有发布的帖子和评论</li>
                      <li>所有创建的频道和直播记录</li>
                      <li>所有个人信息和设置</li>
                      <li>所有通知和消息记录</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirm-username">
                  请输入您的用户名 <span className="text-destructive font-bold">{username}</span> 以确认注销
                </Label>
                <Input
                  id="confirm-username"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`请输入：${username}`}
                  disabled={loading}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || confirmText !== username}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? '注销中...' : '确认注销'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
