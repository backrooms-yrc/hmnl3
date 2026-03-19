import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { searchFace } from '@/services/faceApi';
import { Loader2, Camera, ScanFace } from 'lucide-react';

interface FaceLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FaceLoginDialog({ open, onOpenChange, onSuccess }: FaceLoginDialogProps) {
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const { signInWithFace } = useAuth();

  // 启动摄像头
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // 等待视频元数据加载完成
        videoRef.current.onloadedmetadata = () => {
          setCameraActive(true);
        };
      }
    } catch (error) {
      console.error('启动摄像头失败:', error);
      toast({
        title: '摄像头错误',
        description: '无法访问摄像头，请检查权限设置',
        variant: 'destructive',
      });
    }
  };

  // 停止摄像头
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // 捕获图片并识别
  const handleCapture = async () => {
    if (!videoRef.current || !cameraActive) {
      toast({
        title: '错误',
        description: '请先启动摄像头',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // 创建canvas捕获当前帧
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建canvas context');
      }

      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = base64.split(',')[1];

      // 调用人脸搜索API
      const result = await searchFace(base64Data);

      if (result.success && result.userId) {
        // 找到匹配的人脸，使用userId登录
        const { error } = await signInWithFace(result.userId);
        
        if (error) {
          toast({
            title: '登录失败',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: '登录成功',
            description: `人脸识别成功，匹配度：${result.score?.toFixed(2)}%`,
          });
          stopCamera();
          onOpenChange(false);
          onSuccess?.();
        }
      } else {
        toast({
          title: '识别失败',
          description: result.message || '未找到匹配的人脸，请先注册人脸信息',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('人脸识别失败:', error);
      toast({
        title: '识别失败',
        description: error.message || '人脸识别失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onOpenChange(false);
  };

  // 组件挂载时启动摄像头
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="w-5 h-5" />
            人脸识别登录
          </DialogTitle>
          <DialogDescription>
            将您的面部对准摄像头，点击识别按钮进行登录
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 摄像头预览 */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <Camera className="w-12 h-12 mb-2" />
                <p className="text-sm">正在启动摄像头...</p>
              </div>
            )}
            
            {/* 人脸框提示 */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-primary rounded-full opacity-50" />
              </div>
            )}
          </div>

          {/* 提示信息 */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• 请确保光线充足</p>
            <p>• 将面部完整置于圆圈内</p>
            <p>• 保持面部正对摄像头</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            取消
          </Button>
          <Button
            onClick={handleCapture}
            className="flex-1"
            disabled={loading || !cameraActive}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                识别中...
              </>
            ) : (
              <>
                <ScanFace className="w-4 h-4 mr-2" />
                开始识别
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
