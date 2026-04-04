import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isFAHMNLApp } from '@/utils/device-detect';

type DeviceType = 'mobile' | 'desktop';

interface DeviceContextType {
  deviceType: DeviceType;
  isMobile: boolean;
  isDesktop: boolean;
  isFAHMNL: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('ipad')) return 'desktop';
  
  const mobileKeywords = [
    'android',
    'webos', 
    'iphone',
    'ipod',
    'blackberry',
    'windows phone'
  ];
  
  const isMobileDevice = mobileKeywords.some(keyword => ua.includes(keyword));
  
  if (ua.includes('mobile') && !ua.includes('ipad')) {
    return 'mobile';
  }
  
  return isMobileDevice ? 'mobile' : 'desktop';
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [deviceType] = useState<DeviceType>(() => {
    const detected = detectDeviceType();
    
    console.log('[设备检测]', {
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      检测结果: detected,
      是否iPad: typeof window !== 'undefined' ? navigator.userAgent.toLowerCase().includes('ipad') : false,
      是否移动端: detected === 'mobile'
    });
    
    return detected;
  });

  const [isFAHMNL, setIsFAHMNL] = useState<boolean>(() => {
    return isFAHMNLApp();
  });

  useEffect(() => {
    const checkFAHMNL = () => {
      const result = isFAHMNLApp();
      setIsFAHMNL(result);
      
      if (result) {
        document.documentElement.setAttribute('data-app-mode', 'fahmnl');
        document.body.classList.add('fahmnl-app-mode');
      } else {
        document.documentElement.removeAttribute('data-app-mode');
        document.body.classList.remove('fahmnl-app-mode');
      }
    };

    checkFAHMNL();
    
    const interval = setInterval(checkFAHMNL, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const value: DeviceContextType = {
    deviceType,
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
    isFAHMNL,
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
