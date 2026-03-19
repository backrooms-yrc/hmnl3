// 主题配置文件

export interface ThemeColors {
  // 基础颜色
  background: string;
  foreground: string;
  
  // 卡片
  card: string;
  cardForeground: string;
  
  // 弹出层
  popover: string;
  popoverForeground: string;
  
  // 主色调
  primary: string;
  primaryForeground: string;
  
  // 次要色
  secondary: string;
  secondaryForeground: string;
  
  // 强调色
  accent: string;
  accentForeground: string;
  
  // 静音色
  muted: string;
  mutedForeground: string;
  
  // 边框
  border: string;
  input: string;
  ring: string;
  
  // 状态色
  destructive: string;
  destructiveForeground: string;
  
  // 图表颜色
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  
  // 侧边栏颜色
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  light: ThemeColors;
  dark: ThemeColors;
}

// 默认主题 - 深蓝色+橙色（原有配色）
export const oceanTheme: Theme = {
  id: 'ocean',
  name: '深海蓝',
  description: '专业稳重的深蓝色主题',
  light: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    popover: '0 0% 100%',
    popoverForeground: '222.2 84% 4.9%',
    primary: '210 100% 24%', // 深蓝色 #2c3e50
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96.1%',
    secondaryForeground: '222.2 47.4% 11.2%',
    accent: '28 80% 52%', // 橙色 #f39c12
    accentForeground: '210 40% 98%',
    muted: '210 40% 96.1%',
    mutedForeground: '215.4 16.3% 46.9%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '210 100% 24%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    chart1: '210 100% 24%',
    chart2: '28 80% 52%',
    chart3: '197 37% 24%',
    chart4: '43 74% 66%',
    chart5: '27 87% 67%',
    // 侧边栏 - 浅色模式：白色背景+淡蓝色
    sidebarBackground: '0 0% 100%', // 白色
    sidebarForeground: '210 100% 24%', // 深蓝色文字
    sidebarPrimary: '210 100% 50%', // 蓝色
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '210 100% 96%', // 淡蓝色
    sidebarAccentForeground: '210 100% 24%', // 深蓝色文字
    sidebarBorder: '210 40% 90%', // 淡蓝色边框
    sidebarRing: '210 100% 50%', // 蓝色焦点环
  },
  dark: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    primary: '210 100% 40%', // 亮蓝色
    primaryForeground: '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '28 80% 52%', // 橙色
    accentForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '210 100% 40%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '210 100% 40%',
    chart2: '28 80% 52%',
    chart3: '197 37% 24%',
    chart4: '43 74% 66%',
    chart5: '27 87% 67%',
    // 侧边栏 - 深色模式
    sidebarBackground: '222.2 84% 8%', // 深色背景
    sidebarForeground: '210 40% 98%', // 浅色文字
    sidebarPrimary: '210 100% 50%', // 蓝色
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '217.2 32.6% 17.5%', // 深蓝灰色
    sidebarAccentForeground: '210 40% 98%', // 浅色文字
    sidebarBorder: '217.2 32.6% 15%', // 深色边框
    sidebarRing: '210 100% 50%', // 蓝色焦点环
  },
};

// 紫罗兰主题 - 优雅神秘
export const violetTheme: Theme = {
  id: 'violet',
  name: '紫罗兰',
  description: '优雅神秘的紫色主题',
  light: {
    background: '0 0% 100%',
    foreground: '224 71.4% 4.1%',
    card: '0 0% 100%',
    cardForeground: '224 71.4% 4.1%',
    popover: '0 0% 100%',
    popoverForeground: '224 71.4% 4.1%',
    primary: '262.1 83.3% 57.8%', // 紫色
    primaryForeground: '210 20% 98%',
    secondary: '220 14.3% 95.9%',
    secondaryForeground: '220.9 39.3% 11%',
    accent: '280 100% 70%', // 亮紫色
    accentForeground: '220.9 39.3% 11%',
    muted: '220 14.3% 95.9%',
    mutedForeground: '220 8.9% 46.1%',
    border: '220 13% 91%',
    input: '220 13% 91%',
    ring: '262.1 83.3% 57.8%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 20% 98%',
    chart1: '262.1 83.3% 57.8%',
    chart2: '280 100% 70%',
    chart3: '291 47% 51%',
    chart4: '270 50% 40%',
    chart5: '252 56% 57%',
    // 侧边栏 - 浅色模式：白色背景+淡紫色
    sidebarBackground: '0 0% 100%', // 白色
    sidebarForeground: '262.1 83.3% 40%', // 深紫色文字
    sidebarPrimary: '262.1 83.3% 57.8%', // 紫色
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '280 100% 96%', // 淡紫色
    sidebarAccentForeground: '262.1 83.3% 40%', // 深紫色文字
    sidebarBorder: '220 13% 91%', // 淡紫色边框
    sidebarRing: '262.1 83.3% 57.8%', // 紫色焦点环
  },
  dark: {
    background: '224 71.4% 4.1%',
    foreground: '210 20% 98%',
    card: '224 71.4% 4.1%',
    cardForeground: '210 20% 98%',
    popover: '224 71.4% 4.1%',
    popoverForeground: '210 20% 98%',
    primary: '263.4 70% 50.4%', // 深紫色
    primaryForeground: '210 20% 98%',
    secondary: '215 27.9% 16.9%',
    secondaryForeground: '210 20% 98%',
    accent: '280 100% 70%', // 亮紫色
    accentForeground: '220.9 39.3% 11%',
    muted: '215 27.9% 16.9%',
    mutedForeground: '217.9 10.6% 64.9%',
    border: '215 27.9% 16.9%',
    input: '215 27.9% 16.9%',
    ring: '263.4 70% 50.4%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 20% 98%',
    chart1: '263.4 70% 50.4%',
    chart2: '280 100% 70%',
    chart3: '291 47% 51%',
    chart4: '270 50% 40%',
    chart5: '252 56% 57%',
    // 侧边栏 - 深色模式
    sidebarBackground: '224 71.4% 8%', // 深色背景
    sidebarForeground: '210 20% 98%', // 浅色文字
    sidebarPrimary: '263.4 70% 50.4%', // 紫色
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '215 27.9% 16.9%', // 深紫灰色
    sidebarAccentForeground: '210 20% 98%', // 浅色文字
    sidebarBorder: '215 27.9% 14%', // 深色边框
    sidebarRing: '263.4 70% 50.4%', // 紫色焦点环
  },
};

// 翡翠绿主题 - 清新自然
export const emeraldTheme: Theme = {
  id: 'emerald',
  name: '翡翠绿',
  description: '清新自然的绿色主题',
  light: {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    cardForeground: '240 10% 3.9%',
    popover: '0 0% 100%',
    popoverForeground: '240 10% 3.9%',
    primary: '160 84% 39%', // 翡翠绿
    primaryForeground: '0 0% 98%',
    secondary: '240 4.8% 95.9%',
    secondaryForeground: '240 5.9% 10%',
    accent: '142 76% 36%', // 深绿色
    accentForeground: '0 0% 98%',
    muted: '240 4.8% 95.9%',
    mutedForeground: '240 3.8% 46.1%',
    border: '240 5.9% 90%',
    input: '240 5.9% 90%',
    ring: '160 84% 39%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '0 0% 98%',
    chart1: '160 84% 39%',
    chart2: '142 76% 36%',
    chart3: '173 58% 39%',
    chart4: '152 57% 40%',
    chart5: '151 55% 41.5%',
    // 侧边栏 - 浅色模式：白色背景+淡绿色
    sidebarBackground: '0 0% 100%', // 白色
    sidebarForeground: '151 55% 25%', // 深绿色文字
    sidebarPrimary: '151 55% 41.5%', // 绿色
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '151 55% 96%', // 淡绿色
    sidebarAccentForeground: '151 55% 25%', // 深绿色文字
    sidebarBorder: '142.1 76.2% 90%', // 淡绿色边框
    sidebarRing: '151 55% 41.5%', // 绿色焦点环
  },
  dark: {
    background: '240 10% 3.9%',
    foreground: '0 0% 98%',
    card: '240 10% 3.9%',
    cardForeground: '0 0% 98%',
    popover: '240 10% 3.9%',
    popoverForeground: '0 0% 98%',
    primary: '160 84% 39%', // 翡翠绿
    primaryForeground: '0 0% 98%',
    secondary: '240 3.7% 15.9%',
    secondaryForeground: '0 0% 98%',
    accent: '142 76% 36%', // 深绿色
    accentForeground: '0 0% 98%',
    muted: '240 3.7% 15.9%',
    mutedForeground: '240 5% 64.9%',
    border: '240 3.7% 15.9%',
    input: '240 3.7% 15.9%',
    ring: '160 84% 39%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '0 0% 98%',
    chart1: '160 84% 39%',
    chart2: '142 76% 36%',
    chart3: '173 58% 39%',
    chart4: '152 57% 40%',
    chart5: '151 55% 41.5%',
    // 侧边栏 - 深色模式
    sidebarBackground: '220 8.9% 8%', // 深色背景
    sidebarForeground: '144.9 80.4% 90%', // 浅色文字
    sidebarPrimary: '151 55% 41.5%', // 绿色
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '215.3 25% 16.9%', // 深绿灰色
    sidebarAccentForeground: '144.9 80.4% 90%', // 浅色文字
    sidebarBorder: '215.3 25% 14%', // 深色边框
    sidebarRing: '151 55% 41.5%', // 绿色焦点环
  },
};

// 日落橙主题 - 温暖活力
export const sunsetTheme: Theme = {
  id: 'sunset',
  name: '日落橙',
  description: '温暖活力的橙色主题',
  light: {
    background: '0 0% 100%',
    foreground: '20 14.3% 4.1%',
    card: '0 0% 100%',
    cardForeground: '20 14.3% 4.1%',
    popover: '0 0% 100%',
    popoverForeground: '20 14.3% 4.1%',
    primary: '24.6 95% 53.1%', // 橙色
    primaryForeground: '60 9.1% 97.8%',
    secondary: '60 4.8% 95.9%',
    secondaryForeground: '24 9.8% 10%',
    accent: '12 76% 61%', // 珊瑚橙
    accentForeground: '24 9.8% 10%',
    muted: '60 4.8% 95.9%',
    mutedForeground: '25 5.3% 44.7%',
    border: '20 5.9% 90%',
    input: '20 5.9% 90%',
    ring: '24.6 95% 53.1%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '60 9.1% 97.8%',
    chart1: '24.6 95% 53.1%',
    chart2: '12 76% 61%',
    chart3: '27 87% 67%',
    chart4: '33 100% 50%',
    chart5: '43 74% 66%',
    // 侧边栏 - 浅色模式：白色背景+淡橙色
    sidebarBackground: '0 0% 100%', // 白色
    sidebarForeground: '24.6 95% 30%', // 深橙色文字
    sidebarPrimary: '24.6 95% 53.1%', // 橙色
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '24.6 95% 96%', // 淡橙色
    sidebarAccentForeground: '24.6 95% 30%', // 深橙色文字
    sidebarBorder: '20 5.9% 90%', // 淡橙色边框
    sidebarRing: '24.6 95% 53.1%', // 橙色焦点环
  },
  dark: {
    background: '20 14.3% 4.1%',
    foreground: '60 9.1% 97.8%',
    card: '20 14.3% 4.1%',
    cardForeground: '60 9.1% 97.8%',
    popover: '20 14.3% 4.1%',
    popoverForeground: '60 9.1% 97.8%',
    primary: '20.5 90.2% 48.2%', // 深橙色
    primaryForeground: '60 9.1% 97.8%',
    secondary: '12 6.5% 15.1%',
    secondaryForeground: '60 9.1% 97.8%',
    accent: '12 76% 61%', // 珊瑚橙
    accentForeground: '24 9.8% 10%',
    muted: '12 6.5% 15.1%',
    mutedForeground: '24 5.4% 63.9%',
    border: '12 6.5% 15.1%',
    input: '12 6.5% 15.1%',
    ring: '20.5 90.2% 48.2%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '60 9.1% 97.8%',
    chart1: '20.5 90.2% 48.2%',
    chart2: '12 76% 61%',
    chart3: '27 87% 67%',
    chart4: '33 100% 50%',
    chart5: '43 74% 66%',
    // 侧边栏 - 深色模式
    sidebarBackground: '20 14.3% 8%', // 深色背景
    sidebarForeground: '60 9.1% 97.8%', // 浅色文字
    sidebarPrimary: '20.5 90.2% 48.2%', // 橙色
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '12 6.5% 15.1%', // 深橙灰色
    sidebarAccentForeground: '60 9.1% 97.8%', // 浅色文字
    sidebarBorder: '12 6.5% 13%', // 深色边框
    sidebarRing: '20.5 90.2% 48.2%', // 橙色焦点环
  },
};

// 玫瑰红主题 - 浪漫优雅
export const roseTheme: Theme = {
  id: 'rose',
  name: '玫瑰红',
  description: '浪漫优雅的粉红主题',
  light: {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    cardForeground: '240 10% 3.9%',
    popover: '0 0% 100%',
    popoverForeground: '240 10% 3.9%',
    primary: '346.8 77.2% 49.8%', // 玫瑰红
    primaryForeground: '355.7 100% 97.3%',
    secondary: '240 4.8% 95.9%',
    secondaryForeground: '240 5.9% 10%',
    accent: '340 82% 52%', // 亮粉色
    accentForeground: '240 5.9% 10%',
    muted: '240 4.8% 95.9%',
    mutedForeground: '240 3.8% 46.1%',
    border: '240 5.9% 90%',
    input: '240 5.9% 90%',
    ring: '346.8 77.2% 49.8%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '355.7 100% 97.3%',
    chart1: '346.8 77.2% 49.8%',
    chart2: '340 82% 52%',
    chart3: '350 89% 60%',
    chart4: '339 90% 51%',
    chart5: '343 81% 55%',
    // 侧边栏 - 浅色模式：白色背景+淡粉色
    sidebarBackground: '0 0% 100%', // 白色
    sidebarForeground: '343 81% 30%', // 深红色文字
    sidebarPrimary: '343 81% 55%', // 玫瑰红
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '343 81% 96%', // 淡粉色
    sidebarAccentForeground: '343 81% 30%', // 深红色文字
    sidebarBorder: '346.8 77.2% 90%', // 淡粉色边框
    sidebarRing: '343 81% 55%', // 玫瑰红焦点环
  },
  dark: {
    background: '240 10% 3.9%',
    foreground: '0 0% 98%',
    card: '240 10% 3.9%',
    cardForeground: '0 0% 98%',
    popover: '240 10% 3.9%',
    popoverForeground: '0 0% 98%',
    primary: '346.8 77.2% 49.8%', // 玫瑰红
    primaryForeground: '355.7 100% 97.3%',
    secondary: '240 3.7% 15.9%',
    secondaryForeground: '0 0% 98%',
    accent: '340 82% 52%', // 亮粉色
    accentForeground: '240 5.9% 10%',
    muted: '240 3.7% 15.9%',
    mutedForeground: '240 5% 64.9%',
    border: '240 3.7% 15.9%',
    input: '240 3.7% 15.9%',
    ring: '346.8 77.2% 49.8%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '0 0% 98%',
    chart1: '346.8 77.2% 49.8%',
    chart2: '340 82% 52%',
    chart3: '350 89% 60%',
    chart4: '339 90% 51%',
    chart5: '343 81% 55%',
    // 侧边栏 - 深色模式
    sidebarBackground: '240 10% 8%', // 深色背景
    sidebarForeground: '0 0% 90%', // 浅色文字
    sidebarPrimary: '343 81% 55%', // 玫瑰红
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '240 3.7% 16.9%', // 深灰色
    sidebarAccentForeground: '0 0% 90%', // 浅色文字
    sidebarBorder: '240 3.7% 14%', // 深色边框
    sidebarRing: '343 81% 55%', // 玫瑰红焦点环
  },
};

// 天空蓝主题 - 清爽明快
export const skyTheme: Theme = {
  id: 'sky',
  name: '天空蓝',
  description: '清爽明快的蓝色主题',
  light: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    popover: '0 0% 100%',
    popoverForeground: '222.2 84% 4.9%',
    primary: '199 89% 48%', // 天空蓝
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96.1%',
    secondaryForeground: '222.2 47.4% 11.2%',
    accent: '186 100% 42%', // 青色
    accentForeground: '210 40% 98%',
    muted: '210 40% 96.1%',
    mutedForeground: '215.4 16.3% 46.9%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '199 89% 48%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    chart1: '199 89% 48%',
    chart2: '186 100% 42%',
    chart3: '204 94% 44%',
    chart4: '189 94% 43%',
    chart5: '195 100% 39%',
    // 侧边栏 - 浅色模式：白色背景+淡天蓝色
    sidebarBackground: '0 0% 100%', // 白色
    sidebarForeground: '195 100% 25%', // 深蓝色文字
    sidebarPrimary: '195 100% 39%', // 天空蓝
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '195 100% 96%', // 淡天蓝色
    sidebarAccentForeground: '195 100% 25%', // 深蓝色文字
    sidebarBorder: '199 89.1% 90%', // 淡蓝色边框
    sidebarRing: '195 100% 39%', // 天空蓝焦点环
  },
  dark: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    primary: '199 89% 48%', // 天空蓝
    primaryForeground: '210 40% 98%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '186 100% 42%', // 青色
    accentForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '199 89% 48%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '199 89% 48%',
    chart2: '186 100% 42%',
    chart3: '204 94% 44%',
    chart4: '189 94% 43%',
    chart5: '195 100% 39%',
    // 侧边栏 - 深色模式
    sidebarBackground: '222.2 47.4% 8%', // 深色背景
    sidebarForeground: '213 31% 90%', // 浅色文字
    sidebarPrimary: '195 100% 39%', // 天空蓝
    sidebarPrimaryForeground: '0 0% 100%', // 白色文字
    sidebarAccent: '215.4 16.3% 16.9%', // 深蓝灰色
    sidebarAccentForeground: '213 31% 90%', // 浅色文字
    sidebarBorder: '215.4 16.3% 14%', // 深色边框
    sidebarRing: '195 100% 39%', // 天空蓝焦点环
  },
};

// 所有主题列表
export const themes: Theme[] = [
  oceanTheme,
  violetTheme,
  emeraldTheme,
  sunsetTheme,
  roseTheme,
  skyTheme,
];

// 根据ID获取主题
export function getThemeById(id: string): Theme {
  return themes.find(theme => theme.id === id) || oceanTheme;
}
