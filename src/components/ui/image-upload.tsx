import { useState, useRef } from 'react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  className?: string;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export function ImageUpload({ 
  currentImage, 
  onUpload, 
  onRemove,
  className,
  label = '上传图片',
  aspectRatio = 'square'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]'
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '错误',
        description: '请选择图片文件',
        variant: 'destructive',
      });
      return;
    }

    // 验证文件大小（1MB）
    if (file.size > 1024 * 1024) {
      toast({
        title: '错误',
        description: '图片大小不能超过1MB',
        variant: 'destructive',
      });
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 上传图片
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await onUpload(file);
      setPreview(url);
      toast({
        title: '上传成功',
        description: '图片已上传',
      });
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: '上传失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="relative">
        <div className={cn(
          'w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center border-2 border-dashed border-border',
          aspectRatioClasses[aspectRatio]
        )}>
          {preview ? (
            <img src={preview} alt="图片预览" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="w-12 h-12" />
              <p className="text-sm">暂无图片</p>
            </div>
          )}
        </div>
        
        {preview && !uploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-8 h-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? '上传中...' : label}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          支持JPG、PNG格式，大小不超过1MB
        </p>
      </div>
    </div>
  );
}
