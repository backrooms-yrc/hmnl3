import QRCode from 'qrcode';

export interface ShareImageData {
  channelName: string;
  channelDescription: string | null;
  channelIcon: string | null;
  channelUrl: string;
  siteLogo?: string;
}

export interface GeneratedShareImage {
  dataUrl: string;
  width: number;
  height: number;
  cacheKey: string;
}

const PLACEHOLDER_ICON = '/images/logo/channel-placeholder.png';
const SITE_LOGO = '/images/logo/logo-icon.svg';

const LAYOUT_CONFIG = {
  width: 800,
  height: 600,
  padding: 40,
  borderRadius: 16,
  
  header: {
    iconSize: 100,
    iconX: 70,
    iconY: 70,
    textGap: 24,
    titleFontSize: 28,
    descFontSize: 16,
    lineHeight: 1.4,
  },
  
  logo: {
    size: 48,
    margin: 30,
  },
  
  qrCode: {
    size: 150,
    margin: 30,
  },
  
  footer: {
    height: 60,
    dividerMargin: 40,
  },
  
  colors: {
    background: {
      start: '#f8fafc',
      end: '#e2e8f0',
    },
    card: '#ffffff',
    cardShadow: 'rgba(0, 0, 0, 0.08)',
    title: '#1e293b',
    description: '#64748b',
    accent: '#6366f1',
    placeholder: '#e2e8f0',
    placeholderText: '#94a3b8',
    divider: '#e2e8f0',
    footerText: '#94a3b8',
    qrHint: '#64748b',
  },
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[]
): void {
  const radii = typeof radius === 'number' 
    ? [radius, radius, radius, radius] 
    : radius;
  
  const [tl, tr, br, bl] = radii;
  
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function generateQRCode(url: string, size: number = 150): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 2,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
  return canvas;
}

function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number
): number {
  ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  return ctx.measureText(text).width;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  maxLines: number = 3
): string[] {
  const chars = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;

  for (const char of chars) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
      
      if (lines.length >= maxLines) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  if (lines.length === maxLines) {
    const lastLine = lines[lines.length - 1];
    const lastLineWidth = ctx.measureText(lastLine).width;
    const ellipsisWidth = ctx.measureText('...').width;
    
    if (lastLineWidth + ellipsisWidth > maxWidth && lastLine.length > 3) {
      let truncated = lastLine;
      while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 1) {
        truncated = truncated.slice(0, -1);
      }
      lines[lines.length - 1] = truncated + '...';
    } else if (text.length > lines.join('').length) {
      lines[lines.length - 1] = lastLine + '...';
    }
  }

  return lines;
}

function generateCacheKey(data: ShareImageData): string {
  const content = `${data.channelName}|${data.channelDescription || ''}|${data.channelIcon || ''}|${data.channelUrl}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

async function saveToServerCache(cacheKey: string, dataUrl: string): Promise<void> {
  try {
    await fetch('/api/share-image/cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cacheKey,
        imageData: dataUrl,
      }),
    });
  } catch (error) {
    console.warn('Failed to save to server cache:', error);
  }
}

async function deleteFromServerCache(cacheKey: string): Promise<void> {
  try {
    await fetch(`/api/share-image/cache/${cacheKey}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('Failed to delete from server cache:', error);
  }
}

export async function generateShareImage(data: ShareImageData): Promise<GeneratedShareImage> {
  const { width, height, padding, borderRadius, header, logo, qrCode, footer, colors } = LAYOUT_CONFIG;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, 0, 0, width, height, borderRadius);
  ctx.fill();

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.background.start);
  gradient.addColorStop(1, colors.background.end);
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, 0, width, height, borderRadius);
  ctx.fill();

  ctx.fillStyle = colors.card;
  ctx.shadowColor = colors.cardShadow;
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, padding, padding, width - padding * 2, height - padding * 2, 12);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  try {
    const iconSrc = data.channelIcon || PLACEHOLDER_ICON;
    const iconImg = await loadImage(iconSrc);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(header.iconX + header.iconSize / 2, header.iconY + header.iconSize / 2, header.iconSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(iconImg, header.iconX, header.iconY, header.iconSize, header.iconSize);
    ctx.restore();
  } catch {
    ctx.fillStyle = colors.placeholder;
    ctx.beginPath();
    ctx.arc(header.iconX + header.iconSize / 2, header.iconY + header.iconSize / 2, header.iconSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = colors.placeholderText;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.channelName.charAt(0) || '?', header.iconX + header.iconSize / 2, header.iconY + header.iconSize / 2);
  }

  const textX = header.iconX + header.iconSize + header.textGap;
  const textMaxWidth = width - textX - padding - logo.margin - logo.size;

  ctx.fillStyle = colors.title;
  ctx.font = `bold ${header.titleFontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const nameLines = wrapText(ctx, data.channelName, textMaxWidth, header.titleFontSize, 2);
  const titleLineHeight = header.titleFontSize * header.lineHeight;
  nameLines.forEach((line, index) => {
    ctx.fillText(line, textX, header.iconY + 10 + index * titleLineHeight);
  });

  if (data.channelDescription) {
    ctx.fillStyle = colors.description;
    ctx.font = `${header.descFontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    const descLines = wrapText(ctx, data.channelDescription, textMaxWidth, header.descFontSize, 3);
    const descY = header.iconY + 10 + nameLines.length * titleLineHeight + 12;
    const descLineHeight = header.descFontSize * header.lineHeight;
    descLines.forEach((line, index) => {
      ctx.fillText(line, textX, descY + index * descLineHeight);
    });
  }

  const logoX = width - padding - logo.margin - logo.size;
  const logoY = padding + logo.margin;

  try {
    const logoImg = await loadImage(SITE_LOGO);
    ctx.drawImage(logoImg, logoX, logoY, logo.size, logo.size);
  } catch {
    ctx.fillStyle = colors.accent;
    drawRoundedRect(ctx, logoX, logoY, logo.size, logo.size, 8);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HM', logoX + logo.size / 2, logoY + logo.size / 2);
  }

  const qrX = width - padding - qrCode.margin - qrCode.size;
  const qrY = height - padding - qrCode.margin - qrCode.size;

  try {
    const qrCanvas = await generateQRCode(data.channelUrl, qrCode.size);
    ctx.drawImage(qrCanvas, qrX, qrY, qrCode.size, qrCode.size);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    ctx.fillStyle = colors.placeholder;
    ctx.fillRect(qrX, qrY, qrCode.size, qrCode.size);
    ctx.fillStyle = colors.placeholderText;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', qrX + qrCode.size / 2, qrY + qrCode.size / 2);
  }

  ctx.fillStyle = colors.qrHint;
  ctx.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('扫码观看直播', qrX + qrCode.size / 2, qrY + qrCode.size + 16);

  const dividerY = height - padding - qrCode.margin - qrCode.size - footer.dividerMargin;
  ctx.strokeStyle = colors.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding + 30, dividerY);
  ctx.lineTo(width - padding - 30, dividerY);
  ctx.stroke();

  ctx.fillStyle = colors.footerText;
  ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('HMNL直播系统', padding + 30, height - padding - 20);

  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const cacheKey = generateCacheKey(data);
  
  await saveToServerCache(cacheKey, dataUrl);

  return {
    dataUrl,
    width,
    height,
    cacheKey,
  };
}

export function downloadImage(dataUrl: string, filename: string, cacheKey?: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (cacheKey) {
    setTimeout(() => {
      deleteFromServerCache(cacheKey).catch(console.warn);
    }, 1000);
  }
}

export function generateFilename(channelName: string, channelId: string): string {
  const sanitized = channelName.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
  const timestamp = new Date().toISOString().split('T')[0];
  return `share_${sanitized}_${channelId.substring(0, 8)}_${timestamp}.png`;
}
