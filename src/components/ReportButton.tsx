import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReportDialog } from './ReportDialog';
import type { ReportType } from '@/types/types';
import { Flag } from 'lucide-react';

interface ReportButtonProps {
  reportType: ReportType;
  targetId: string;
  targetName?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function ReportButton({
  reportType,
  targetId,
  targetName,
  variant = 'ghost',
  size = 'sm',
  showText = true,
}: ReportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Flag className="w-4 h-4" />
        {showText && <span className="ml-1">举报</span>}
      </Button>

      <ReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reportType={reportType}
        targetId={targetId}
        targetName={targetName}
      />
    </>
  );
}
