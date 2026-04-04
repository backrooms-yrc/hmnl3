/**
 * 设备检测工具
 * 只有明确检测到移动设备（手机）才返回true，iPad和PC都视为PC端
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent.toLowerCase();
  
  // iPad明确视为PC端
  if (ua.includes('ipad')) return false;
  
  // 检测是否为移动设备（排除iPad）
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile'
  ];
  
  // 如果包含mobile关键词但不是iPad，才视为移动设备
  const isMobile = mobileKeywords.some(keyword => ua.includes(keyword));
  
  // 再次确认不是iPad
  return isMobile && !ua.includes('ipad');
}

export function getDeviceType(): 'mobile' | 'pc' {
  return isMobileDevice() ? 'mobile' : 'pc';
}

export function isFAHMNLApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();
  
  return uaLower.includes('fahmnl');
}

export function getAppMode(): 'fahmnl' | 'normal' {
  return isFAHMNLApp() ? 'fahmnl' : 'normal';
}

export interface DeviceInfo {
  isMobile: boolean;
  isFAHMNL: boolean;
  deviceType: 'mobile' | 'pc';
  appMode: 'fahmnl' | 'normal';
}

export function getDeviceInfo(): DeviceInfo {
  return {
    isMobile: isMobileDevice(),
    isFAHMNL: isFAHMNLApp(),
    deviceType: getDeviceType(),
    appMode: getAppMode(),
  };
}
