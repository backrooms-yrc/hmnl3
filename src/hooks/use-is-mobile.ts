import { useState, useEffect } from 'react';
import { isMobileDevice } from '@/utils/device-detect';

/**
 * 设备类型检测Hook
 * 返回是否为移动设备（手机）
 * iPad和PC都返回false
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 初始检测
    setIsMobile(isMobileDevice());

    // 监听窗口大小变化（虽然主要依赖UA，但也支持动态调整）
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
