import { useState, useRef } from 'react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

export function AvatarUpload({ currentAvatar, onUpload, className }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      await onUpload(file);
      toast({
        title: '上传成功',
        description: '头像已更新',
      });
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: '上传失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative">
        <div className="w-24 h-24 xl:w-32 xl:h-32 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="头像预览" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-3xl xl:text-4xl font-bold">
              ?
            </div>
          )}
        </div>
        
        {preview && !uploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
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
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? '上传中...' : '选择头像'}
        </Button>
        <p className="text-xs text-muted-foreground">
          支持JPG、PNG格式，大小不超过1MB
        </p>
      </div>
    </div>
  );
}
