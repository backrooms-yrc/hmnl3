import { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getActivePopupAnnouncements } from '@/db/api';
import type { PopupAnnouncement } from '@/types/types';
import { X, Bell, Sparkles } from 'lucide-react';
import DOMPurify from 'dompurify';

const AnnouncementContent = memo(({ content }: { content: string }) => (
  <div 
    className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-[hsl(var(--md-sys-color-on-surface))]"
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }) }}
  />
));

AnnouncementContent.displayName = 'AnnouncementContent';

export function PopupAnnouncementDialog() {
  const [announcement, setAnnouncement] = useState<PopupAnnouncement | null>(null);
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const announcements = await getActivePopupAnnouncements();
        if (isMountedRef.current && announcements.length > 0) {
          setAnnouncement(announcements[0]);
          requestAnimationFrame(() => {
            if (isMountedRef.current) {
              setOpen(true);
            }
          });
        }
      } catch (error) {
        console.error('加载公告失败:', error);
      }
    };

    loadAnnouncement();
    
    return () => {
      isMountedRef.current = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const executeClose = useCallback(() => {
    if (isClosing) return;
    
    setIsClosing(true);
    setOpen(false);
    
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
    }, 300);
  }, [isClosing]);

  const handleCloseButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    executeClose();
  }, [executeClose]);

  const handleConfirmClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    executeClose();
  }, [executeClose]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !isClosing) {
      executeClose();
    }
  }, [executeClose, isClosing]);

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="
          w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] overflow-hidden glass-dialog
          p-4 sm:p-6
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100
          duration-300
        "
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-0 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="
              w-8 h-8 sm:w-10 sm:h-10 
              rounded-mdui-lg 
              bg-gradient-to-br from-[hsl(var(--md-sys-color-primary))] to-[hsl(var(--md-sys-color-tertiary))] 
              flex items-center justify-center shadow-lg shrink-0
            ">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="
                text-base sm:text-xl font-bold text-[hsl(var(--md-sys-color-on-surface))] 
                truncate leading-tight
              ">
                {announcement.title}
              </DialogTitle>
              <p className="
                text-xs text-[hsl(var(--md-sys-color-on-surface-variant))] 
                flex items-center gap-1 mt-0.5
              ">
                <Sparkles className="w-3 h-3" />
                <span>系统公告</span>
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <DialogDescription asChild>
          <div className="
            mt-2 max-h-[40vh] sm:max-h-[50vh] 
            overflow-y-auto pr-1 sm:pr-2 
            text-sm sm:text-base leading-relaxed
            custom-scrollbar
          ">
            <AnnouncementContent content={announcement.content} />
          </div>
        </DialogDescription>
        
        <div className="
          flex flex-col sm:flex-row sm:justify-end 
          gap-2 sm:gap-0 
          mt-4 sm:mt-6 pt-3 sm:pt-4 
          border-t border-[hsl(var(--md-sys-color-outline-variant)/0.2)]
        ">
          <DialogClose asChild>
            <button
              onClick={handleCloseButtonClick}
              className="
                hidden sm:flex items-center justify-center
                absolute right-4 top-4
                w-8 h-8 rounded-mdui-lg
                opacity-70 hover:opacity-100
                transition-opacity duration-200
                focus:outline-none focus:ring-2 focus:ring-ring
              "
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogClose>
          
          <Button 
            onClick={handleConfirmClick}
            disabled={isClosing}
            className="
              w-full sm:w-auto sm:min-w-[100px] 
              h-11 sm:h-auto
              text-base sm:text-sm
              transition-all duration-200 
              hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isClosing ? '关闭中...' : '我知道了'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
