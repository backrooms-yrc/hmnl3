import type { ErrorReport, NetworkInfo } from '@/types/error-handling';

export function getBrowserInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (ua.includes('Firefox/')) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.?\d*)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edg/')) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edg\/(\d+\.?\d*)/)?.[1] || 'Unknown';
  } else if (ua.includes('Chrome/')) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.?\d*)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.?\d*)/)?.[1] || 'Unknown';
  } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
    browserName = 'Opera';
    browserVersion = ua.match(/(?:Opera|OPR)\/(\d+\.?\d*)/)?.[1] || 'Unknown';
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    browserName = 'Internet Explorer';
    browserVersion = ua.match(/(?:MSIE |rv:)(\d+\.?\d*)/)?.[1] || 'Unknown';
  }

  return { name: browserName, version: browserVersion };
}

export function getOSInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let osName = 'Unknown';
  let osVersion = 'Unknown';

  if (ua.includes('Windows NT 10.0')) {
    osName = 'Windows';
    osVersion = '10/11';
  } else if (ua.includes('Windows NT 6.3')) {
    osName = 'Windows';
    osVersion = '8.1';
  } else if (ua.includes('Windows NT 6.2')) {
    osName = 'Windows';
    osVersion = '8';
  } else if (ua.includes('Windows NT 6.1')) {
    osName = 'Windows';
    osVersion = '7';
  } else if (ua.includes('Mac OS X')) {
    osName = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  } else if (ua.includes('Android')) {
    osName = 'Android';
    osVersion = ua.match(/Android (\d+\.?\d*)/)?.[1] || 'Unknown';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    osName = 'iOS';
    osVersion = ua.match(/OS (\d+[._]\d+[._]?\d*)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  } else if (ua.includes('Linux')) {
    osName = 'Linux';
    osVersion = 'Unknown';
  } else if (ua.includes('CrOS')) {
    osName = 'Chrome OS';
    osVersion = 'Unknown';
  }

  return { name: osName, version: osVersion };
}

export function getNetworkInfo(): NetworkInfo {
  const connection = (navigator as Navigator & { connection?: { type?: string; downlink?: number; effectiveType?: string } }).connection;
  
  return {
    online: navigator.onLine,
    connectionType: connection?.type,
    downlink: connection?.downlink,
    effectiveType: connection?.effectiveType,
  };
}

export function generateErrorReport(
  errorType: ErrorReport['errorType'],
  message: string,
  error?: Error | null,
  additionalInfo?: Record<string, unknown>
): ErrorReport {
  const browser = getBrowserInfo();
  const os = getOSInfo();
  const network = getNetworkInfo();

  return {
    timestamp: new Date().toISOString(),
    errorType,
    message,
    stack: error?.stack || undefined,
    url: window.location.href,
    userAgent: navigator.userAgent,
    browserName: browser.name,
    browserVersion: browser.version,
    osName: os.name,
    osVersion: os.version,
    networkInfo: network,
    additionalInfo,
  };
}

export function formatErrorReport(report: ErrorReport): string {
  const lines = [
    '========================================',
    '           错误报告 - HMNL直播系统',
    '========================================',
    '',
    `时间戳: ${report.timestamp}`,
    `错误类型: ${report.errorType.toUpperCase()}`,
    `错误消息: ${report.message}`,
    '',
    '--- 环境信息 ---',
    `浏览器: ${report.browserName} ${report.browserVersion}`,
    `操作系统: ${report.osName} ${report.osVersion}`,
    `当前URL: ${report.url}`,
    '',
    '--- 网络信息 ---',
    `在线状态: ${report.networkInfo?.online ? '在线' : '离线'}`,
    report.networkInfo?.effectiveType ? `连接类型: ${report.networkInfo.effectiveType}` : '',
    report.networkInfo?.downlink ? `下行速度: ${report.networkInfo.downlink} Mbps` : '',
    '',
  ].filter(Boolean);

  if (report.stack) {
    lines.push('--- 错误堆栈 ---');
    lines.push(report.stack);
    lines.push('');
  }

  if (report.additionalInfo && Object.keys(report.additionalInfo).length > 0) {
    lines.push('--- 附加信息 ---');
    Object.entries(report.additionalInfo).forEach(([key, value]) => {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    });
    lines.push('');
  }

  lines.push('--- User Agent ---');
  lines.push(report.userAgent);
  lines.push('');
  lines.push('========================================');

  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('[ErrorHandler] 复制到剪贴板失败:', error);
    return false;
  }
}

export function logError(report: ErrorReport): void {
  console.error('[ErrorHandler] 错误报告:', {
    type: report.errorType,
    message: report.message,
    timestamp: report.timestamp,
    url: report.url,
    browser: `${report.browserName} ${report.browserVersion}`,
    os: `${report.osName} ${report.osVersion}`,
    stack: report.stack,
  });
}
