import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, themes, getThemeById } from '@/config/themes';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setTheme: (themeId: string) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 从localStorage读取保存的主题设置
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'ocean';
    try {
      const saved = localStorage.getItem('theme-id');
      return saved || 'ocean'; // 默认使用深海蓝主题
    } catch {
      return 'ocean';
    }
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('theme-mode');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      // 检测系统主题偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  const theme = getThemeById(themeId);

  // 应用主题到CSS变量
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const root = document.documentElement;
      const colors = mode === 'dark' ? theme.dark : theme.light;

      // 移除旧的主题类
      root.classList.remove('light', 'dark');
      // 添加新的主题类
      root.classList.add(mode);

      // 设置CSS变量
      Object.entries(colors).forEach(([key, value]) => {
        // 将驼峰命名转换为kebab-case
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVarName}`, value);
      });

      // 保存到localStorage
      localStorage.setItem('theme-id', themeId);
      localStorage.setItem('theme-mode', mode);
    } catch (error) {
      console.error('主题应用失败:', error);
    }
  }, [theme, mode, themeId]);

  const setTheme = (newThemeId: string) => {
    setThemeId(newThemeId);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
}
