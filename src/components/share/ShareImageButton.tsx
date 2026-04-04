import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, Download, Loader2, X } from 'lucide-react';
import {
  generateShareImage,
  downloadImage,
  generateFilename,
  type ShareImageData,
  type GeneratedShareImage,
} from '@/utils/share-image';

interface ShareImageButtonProps {
  channelName: string;
  channelDescription: string | null;
  channelIcon: string | null;
  channelId: string;
  className?: string;
  variant?: 'outlined' | 'text' | 'tonal' | 'filled';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareImageButton({
  channelName,
  channelDescription,
  channelIcon,
  channelId,
  className,
  variant = 'outlined',
  size = 'default',
}: ShareImageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedShareImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const shareData: ShareImageData = {
        channelName,
        channelDescription,
        channelIcon,
        channelUrl: `${window.location.origin}/channel/${channelId}`,
      };

      const image = await generateShareImage(shareData);
      setGeneratedImage(image);
    } catch (err) {
      console.error('Failed to generate share image:', err);
      setError(err instanceof Error ? err.message : '生成图片失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }, [channelName, channelDescription, channelIcon, channelId]);

  const handleOpenDialog = useCallback(() => {
    setIsOpen(true);
    handleGenerateImage();
  }, [handleGenerateImage]);

  const handleDownload = useCallback(() => {
    if (generatedImage) {
      const filename = generateFilename(channelName, channelId);
      downloadImage(generatedImage.dataUrl, filename, generatedImage.cacheKey);
    }
  }, [generatedImage, channelName, channelId]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setGeneratedImage(null);
    setError(null);
  }, []);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenDialog}
        className={className}
      >
        <Image className="w-4 h-4 mr-2" />
        以图片分享
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              分享图片
            </DialogTitle>
            <DialogDescription>
              生成包含频道信息和二维码的分享图片
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">正在生成图片...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <X className="w-6 h-6 text-destructive" />
                </div>
                <p className="text-destructive mb-2">生成失败</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outlined" onClick={handleGenerateImage}>
                  重试
                </Button>
              </div>
            )}

            {generatedImage && !isGenerating && !error && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={generatedImage.dataUrl}
                    alt="分享图片"
                    className="w-full h-auto"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载图片
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleGenerateImage}
                  >
                    重新生成
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  图片尺寸: {generatedImage.width} × {generatedImage.height} 像素
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ShareImageButton;
