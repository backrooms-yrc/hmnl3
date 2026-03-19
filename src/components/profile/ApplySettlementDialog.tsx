import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ApplySettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
}

export function ApplySettlementDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: ApplySettlementDialogProps) {
  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>申请入驻HMNL</DialogTitle>
          <DialogDescription>
            确认申请入驻后，您将获得创建频道和开启直播的权限
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">入驻后您将获得：</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>创建专属频道（最多5个）</li>
                  <li>获取RTMP推流地址</li>
                  <li>开启直播功能</li>
                  <li>管理直播互动（公告、投票、抽奖）</li>
                  <li>获得"入驻用户"专属标识</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  入驻申请需要管理员审核，审核通过后即可在"直播管理"页面创建频道。
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '提交中...' : '确认申请'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
