import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/403', '/404'];

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
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[RouteGuard] Loading timeout reached');
        setTimeoutReached(true);
      }
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    if (loading) return;

    const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);
    const isGuestAccessible = matchGuestRoute(location.pathname, GUEST_ROUTES);

    if (!isGuestMode && !user && !isPublic) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }

    if (isGuestMode && !isGuestAccessible && !isPublic) {
      navigate('/', { replace: true });
    }
  }, [user, loading, isGuestMode, location.pathname, navigate]);

  if (loading && !timeoutReached) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm">正在加载...</p>
      </div>
    );
  }

  if (timeoutReached && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">加载超时</h2>
          <p className="text-muted-foreground mb-4">连接服务器时间过长，请检查网络连接后重试</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}