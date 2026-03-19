import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * 设备类型
 * mobile: 手机
 * desktop: PC和iPad
 */
type DeviceType = 'mobile' | 'desktop';

interface DeviceContextType {
  deviceType: DeviceType;
  isMobile: boolean;
  isDesktop: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

/**
 * 检测设备类型（同步执行）
 * 只有明确的手机设备才返回mobile，iPad和PC都返回desktop
 */
function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  
  // iPad明确视为桌面端
  if (ua.includes('ipad')) return 'desktop';
  
  // 检测手机设备
  const mobileKeywords = [
    'android',
    'webos', 
    'iphone',
    'ipod',
    'blackberry',
    'windows phone'
  ];
  
  const isMobileDevice = mobileKeywords.some(keyword => ua.includes(keyword));
  
  // 如果包含mobile但是iPad，仍然返回desktop
  if (ua.includes('mobile') && !ua.includes('ipad')) {
    return 'mobile';
  }
  
  return isMobileDevice ? 'mobile' : 'desktop';
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  // 同步检测，避免闪烁
  const [deviceType] = useState<DeviceType>(() => {
    const detected = detectDeviceType();
    
    // 添加调试日志
    console.log('[设备检测]', {
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      检测结果: detected,
      是否iPad: typeof window !== 'undefined' ? navigator.userAgent.toLowerCase().includes('ipad') : false,
      是否移动端: detected === 'mobile'
    });
    
    return detected;
  });

  const value: DeviceContextType = {
    deviceType,
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice必须在DeviceProvider内部使用');
  }
  return context;
}
