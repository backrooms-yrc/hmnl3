import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Copy, Check, RefreshCw, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ErrorReport } from '@/types/error-handling';
import { formatErrorReport, copyToClipboard } from '@/utils/error-utils';
import { useNavigate } from 'react-router-dom';

interface FatalErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorReport: ErrorReport | null;
}

export function FatalErrorDialog({ isOpen, onClose, errorReport }: FatalErrorDialogProps) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCopyReport = async () => {
    if (!errorReport) return;
    
    setCopying(true);
    try {
      const reportText = formatErrorReport(errorReport);
      const success = await copyToClipboard(reportText);
      
      if (success) {
        setCopied(true);
        toast({
          title: '复制成功',
          description: '错误报告已复制到剪贴板',
        });
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } else {
        toast({
          title: '复制失败',
          description: '无法复制到剪贴板，请手动复制',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[FatalErrorDialog] 复制错误报告失败:', error);
      toast({
        title: '复制失败',
        description: '复制过程中发生错误',
        variant: 'destructive',
      });
    } finally {
      setCopying(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  if (!errorReport) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <DialogTitle className="text-xl text-destructive">页面加载错误</DialogTitle>
          <DialogDescription className="text-base">
            页面加载过程中发生了错误，请尝试刷新页面或返回首页
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">错误信息:</p>
            <p className="text-sm text-muted-foreground break-words">
              {errorReport.message}
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">时间:</span>
              <span>{new Date(errorReport.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">浏览器:</span>
              <span>{errorReport.browserName} {errorReport.browserVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">系统:</span>
              <span>{errorReport.osName} {errorReport.osVersion}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyReport}
            disabled={copying}
            className="w-full sm:w-auto"
          >
            {copying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                复制中...
              </>
            ) : copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                已复制
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                复制错误报告
              </>
            )}
          </Button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="text"
              onClick={handleGoHome}
              className="flex-1 sm:flex-initial"
            >
              <Home className="mr-2 h-4 w-4" />
              返回首页
            </Button>
            <Button onClick={handleRefresh} className="flex-1 sm:flex-initial">
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新页面
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
