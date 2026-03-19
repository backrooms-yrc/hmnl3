import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

// Please add the pages that can be accessed without logging in to PUBLIC_ROUTES.
const PUBLIC_ROUTES = ['/login', '/403', '/404'];

// 访客模式下可以访问的页面
const GUEST_ROUTES = [
  '/', '/posts', '/post/:id', '/user/:userId', '/channels', '/worldview', 
  '/worldview/:id', '/weather', '/map', '/animas-tools', '/help', '/about',
  '/broadcast', '/broadcast/:id', '/profile'
];

function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

function matchGuestRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes(':')) {
      // 处理动态路由
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading, isGuestMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);
    const isGuestAccessible = matchGuestRoute(location.pathname, GUEST_ROUTES);

    // 如果不是访客模式且未登录，重定向到登录页
    if (!isGuestMode && !user && !isPublic) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }

    // 如果是访客模式且访问受限页面，重定向到首页
    if (isGuestMode && !isGuestAccessible && !isPublic) {
      navigate('/', { replace: true });
    }
  }, [user, loading, isGuestMode, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}