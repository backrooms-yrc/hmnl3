import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

import routes from './routes';
import MainLayout from '@/components/layouts/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PerformanceModeProvider } from '@/contexts/PerformanceModeContext';
import { DeviceProvider, useDevice } from '@/contexts/DeviceContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import { Toaster } from '@/components/ui/toaster';
import { useAutoLocation } from '@/hooks/useAutoLocation';
import { AnimatedOutlet, PageTransitionProvider } from '@/components/transitions/AnimatedOutlet';
import { GlobalErrorProvider } from '@/components/error';
import NotFoundPage from '@/pages/NotFound';
import { Live2DWidget } from '@/components/live2d';

const isOldSafari = (() => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  if (!isSafari) return false;
  const version = ua.match(/version\/(\d+)/i);
  return version ? parseInt(version[1], 10) < 16.4 : false;
})();

function RegexErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isOldSafari) return;
    
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Invalid regular expression') || 
          event.message?.includes('invalid group specifier')) {
        console.error('[RegexErrorHandler] Caught regex error:', event.message);
        event.preventDefault();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason);
      if (reason?.includes('Invalid regular expression') || 
          reason?.includes('invalid group specifier')) {
        console.error('[RegexErrorHandler] Caught async regex error:', reason);
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}

function AnimatedRoutes() {
  return (
    <PageTransitionProvider>
      <AnimatedOutlet />
    </PageTransitionProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const { isDesktop } = useDevice();
  
  useAutoLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {isLoginPage ? (
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      ) : (
        <MainLayout>
          <Routes>
            <Route element={<AnimatedRoutes />}>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      )}
      {isDesktop && <Live2DWidget position="left" />}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <DeviceProvider>
        <ThemeProvider>
          <PerformanceModeProvider>
            <AuthProvider>
              <GlobalErrorProvider>
                <RouteGuard>
                  <RegexErrorHandler>
                    <AppContent />
                  </RegexErrorHandler>
                  <Toaster />
                </RouteGuard>
              </GlobalErrorProvider>
            </AuthProvider>
          </PerformanceModeProvider>
        </ThemeProvider>
      </DeviceProvider>
    </Router>
  );
};

export default App;
