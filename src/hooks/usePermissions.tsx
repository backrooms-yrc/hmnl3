import { useAuth } from '@/contexts/AuthContext';

/**
 * 权限检查Hook
 * 用于检查用户是否有权限执行特定操作
 */
export function usePermissions() {
  const { user, isGuestMode } = useAuth();

  // 访客模式下所有权限都为false
  if (isGuestMode) {
    return {
      canChat: false,
      canPost: false,
      canUseAI: false,
      canComment: false,
      canLike: false,
      canFollow: false,
      isGuest: true,
      isAuthenticated: false
    };
  }

  // 已登录用户拥有所有权限
  if (user) {
    return {
      canChat: true,
      canPost: true,
      canUseAI: true,
      canComment: true,
      canLike: true,
      canFollow: true,
      isGuest: false,
      isAuthenticated: true
    };
  }

  // 未登录用户没有权限
  return {
    canChat: false,
    canPost: false,
    canUseAI: false,
    canComment: false,
    canLike: false,
    canFollow: false,
    isGuest: false,
    isAuthenticated: false
  };
}
