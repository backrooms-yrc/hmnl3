import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createReport, checkIfAlreadyReported } from '@/db/api';
import type { ReportType } from '@/types/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType;
  targetId: string;
  targetName?: string; // 被举报对象的名称（用于显示）
}

export function ReportDialog({
  open,
  onOpenChange,
  reportType,
  targetId,
  targetName,
}: ReportDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reportTypeText = {
    message: '消息',
    post: '帖子',
    user: '用户',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: '请先登录',
        description: '您需要登录后才能举报',
        variant: 'destructive',
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: '请填写举报原因',
        description: '举报原因不能为空',
        variant: 'destructive',
      });
      return;
    }

    if (reason.trim().length < 5) {
      toast({
        title: '举报原因太短',
        description: '请详细描述举报原因（至少5个字符）',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // 检查是否已举报过
      const alreadyReported = await checkIfAlreadyReported(
        user.id,
        reportType,
        targetId
      );

      if (alreadyReported) {
        toast({
          title: '您已举报过',
          description: '请等待管理员处理，不要重复举报',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // 创建举报
      await createReport(user.id, reportType, targetId, reason.trim());

      toast({
        title: '举报成功',
        description: '感谢您的反馈，管理员会尽快处理',
      });

      // 重置表单并关闭对话框
      setReason('');
      onOpenChange(false);
    } catch (error) {
      console.error('举报失败:', error);
      toast({
        title: '举报失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            举报{reportTypeText[reportType]}
          </DialogTitle>
          <DialogDescription>
            {targetName && (
              <span className="block mb-2">
                举报对象：<span className="font-medium">{targetName}</span>
              </span>
            )}
            请详细描述您的举报原因，管理员会尽快处理。恶意举报可能会受到处罚。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">举报原因 *</Label>
            <Textarea
              id="reason"
              placeholder="请详细描述违规内容或行为..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              至少5个字符，最多500个字符
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '提交中...' : '提交举报'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
