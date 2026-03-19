import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

import routes from './routes';
import MainLayout from '@/components/layouts/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PerformanceModeProvider } from '@/contexts/PerformanceModeContext';
import { DeviceProvider } from '@/contexts/DeviceContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import { Toaster } from '@/components/ui/toaster';
import { useAutoLocation } from '@/hooks/useAutoLocation';
import { AnimatedOutlet, PageTransitionProvider } from '@/components/transitions/AnimatedOutlet';

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
          <Route path="*" element={<Navigate to="/" replace />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      )}
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
              <RouteGuard>
                <AppContent />
                <Toaster />
              </RouteGuard>
            </AuthProvider>
          </PerformanceModeProvider>
        </ThemeProvider>
      </DeviceProvider>
    </Router>
  );
};

export default App;
