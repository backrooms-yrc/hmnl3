import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PerformanceModeContextType {
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  togglePerformanceMode: () => void;
}

const PerformanceModeContext = createContext<PerformanceModeContextType | undefined>(undefined);

export function PerformanceModeProvider({ children }: { children: ReactNode }) {
  const [performanceMode, setPerformanceModeState] = useState<boolean>(() => {
    // 从 localStorage 读取初始值
    const saved = localStorage.getItem('performanceMode');
    return saved === 'true';
  });

  // 同步到 localStorage
  useEffect(() => {
    localStorage.setItem('performanceMode', String(performanceMode));
    
    // 更新 body 的 class，用于全局样式控制
    if (performanceMode) {
      document.body.classList.add('performance-mode');
    } else {
      document.body.classList.remove('performance-mode');
    }
  }, [performanceMode]);

  const setPerformanceMode = (enabled: boolean) => {
    setPerformanceModeState(enabled);
  };

  const togglePerformanceMode = () => {
    setPerformanceModeState(prev => !prev);
  };

  return (
    <PerformanceModeContext.Provider
      value={{
        performanceMode,
        setPerformanceMode,
        togglePerformanceMode,
      }}
    >
      {children}
    </PerformanceModeContext.Provider>
  );
}

export function usePerformanceMode() {
  const context = useContext(PerformanceModeContext);
  if (context === undefined) {
    throw new Error('usePerformanceMode must be used within a PerformanceModeProvider');
  }
  return context;
}
