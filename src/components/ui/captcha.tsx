import { useEffect, useRef } from 'react';
import { Button } from './button';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onChange: (isValid: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
}

export function Captcha({ onChange, value, onValueChange }: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captchaTextRef = useRef<string>('');

  const generateCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 生成随机验证码文本（4位数字和字母）
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let captchaText = '';
    for (let i = 0; i < 4; i++) {
      captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaTextRef.current = captchaText;

    // 绘制干扰线
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // 绘制验证码文本
    ctx.font = 'bold 32px Arial';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < captchaText.length; i++) {
      const char = captchaText[i];
      const x = 20 + i * 30;
      const y = canvas.height / 2;
      
      // 随机旋转角度
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // 随机颜色
      ctx.fillStyle = `rgb(${Math.random() * 100},${Math.random() * 100},${Math.random() * 100})`;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // 绘制干扰点
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // 重置验证状态
    onChange(false);
    onValueChange('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    // 验证输入
    if (value && captchaTextRef.current) {
      const isValid = value.toLowerCase() === captchaTextRef.current.toLowerCase();
      onChange(isValid);
    }
  }, [value, onChange]);

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={canvasRef}
        width={140}
        height={50}
        className="border border-border rounded"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={generateCaptcha}
        title="刷新验证码"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  );
}
