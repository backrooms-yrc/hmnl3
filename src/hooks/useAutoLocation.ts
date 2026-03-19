import { useEffect } from 'react';
import { getUserLocation } from '@/services/locationService';
import { updateUserLocation } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 自动获取用户IP和城市信息的Hook
 * 在用户登录后自动调用
 */
export function useAutoLocation() {
  const { user } = useAuth();

  useEffect(() => {
    // 只在用户登录时执行
    if (!user) {
      return;
    }

    // 获取用户位置信息
    const fetchLocation = async () => {
      try {
        console.log('开始自动获取用户位置信息...');
        
        const locationInfo = await getUserLocation();
        
        if (locationInfo && locationInfo.city && locationInfo.ip) {
          console.log('获取到位置信息，更新到数据库...');
          
          // 更新到数据库
          await updateUserLocation(
            user.id,
            locationInfo.city,
            locationInfo.ip
          );
          
          console.log('用户位置信息已更新');
        } else {
          console.log('未能获取到有效的位置信息');
        }
      } catch (error) {
        console.error('自动获取位置信息失败:', error);
      }
    };

    // 延迟1秒执行，避免阻塞页面加载
    const timer = setTimeout(fetchLocation, 1000);

    return () => clearTimeout(timer);
  }, [user]);
}
