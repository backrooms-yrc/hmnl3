import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getActiveAnnouncements } from '@/db/api';
import type { Announcement } from '@/types/types';

interface AnnouncementCarouselProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function AnnouncementCarousel({ isVisible = true, onClose }: AnnouncementCarouselProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await getActiveAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('加载公告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 自动轮播
  useEffect(() => {
    if (announcements.length <= 1 || !isVisible) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [announcements.length, currentIndex, isVisible]);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-40 sm:h-48 md:h-56 xl:h-64 animate-pulse bg-muted"></div>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0 || !isVisible) {
    return null;
  }

  const current = announcements[currentIndex];

  return (
    <>
      <Card className="overflow-hidden relative">
        <CardContent className="p-0">
          {/* 响应式高度容器 */}
          <div className="relative h-40 sm:h-48 md:h-56 xl:h-64">
            {/* 公告内容 - 带淡入淡出动画 - 可点击 */}
            <button
              key={currentIndex}
              onClick={() => handleAnnouncementClick(current)}
              className="absolute inset-0 flex flex-col xl:flex-row @container animate-fade-in w-full text-left cursor-pointer hover:bg-accent/5 transition-colors"
            >
              {/* 图片 */}
              {current.image_url && (
                <div className="h-24 sm:h-32 xl:h-full xl:w-2/5 flex-shrink-0">
                  <img
                    src={current.image_url}
                    alt={current.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 文字内容 */}
              <div
                className={`flex-1 p-3 sm:p-4 md:p-5 xl:p-6 flex flex-col justify-center overflow-hidden ${
                  current.image_url ? '' : 'text-center items-center'
                }`}
              >
                <h3 className="text-base sm:text-lg md:text-xl xl:text-2xl font-bold mb-1 sm:mb-2 line-clamp-2">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2 sm:line-clamp-3 xl:line-clamp-4">
                  {current.content}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  点击查看详情
                </p>
              </div>
            </button>

          {/* 关闭按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 h-7 w-7 sm:h-9 sm:w-9 bg-background/80 hover:bg-background backdrop-blur-sm"
            onClick={handleClose}
            title="关闭公告"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>

          {/* 导航按钮 */}
          {announcements.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-9 sm:w-9 bg-background/80 hover:bg-background backdrop-blur-sm z-10"
                onClick={handlePrev}
                disabled={isAnimating}
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-9 sm:w-9 bg-background/80 hover:bg-background backdrop-blur-sm z-10"
                onClick={handleNext}
                disabled={isAnimating}
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>

              {/* 指示器 */}
              <div className="absolute bottom-1 sm:bottom-2 xl:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isAnimating && index !== currentIndex) {
                        setIsAnimating(true);
                        setCurrentIndex(index);
                        setTimeout(() => setIsAnimating(false), 500);
                      }
                    }}
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-primary w-6 sm:w-8'
                        : 'bg-muted-foreground/30 w-1.5 sm:w-2 hover:bg-muted-foreground/50'
                    }`}
                    title={`切换到第 ${index + 1} 条公告`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>

    {/* 公告详情对话框 */}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {selectedAnnouncement?.title}
          </DialogTitle>
          <DialogDescription>
            发布时间: {selectedAnnouncement?.created_at ? new Date(selectedAnnouncement.created_at).toLocaleString('zh-CN') : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* 图片 */}
          {selectedAnnouncement?.image_url && (
            <div className="w-full rounded-lg overflow-hidden">
              <img
                src={selectedAnnouncement.image_url}
                alt={selectedAnnouncement.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          {/* 内容 */}
          <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-sm sm:text-base">
              {selectedAnnouncement?.content}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}
