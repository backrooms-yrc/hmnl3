import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePerformanceMode } from '@/contexts/PerformanceModeContext';
import { useDevice } from '@/contexts/DeviceContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { PopupAnnouncementDialog } from '@/components/PopupAnnouncementDialog';
import { 
  Home, 
  MessageSquare, 
  PenSquare, 
  User, 
  Bell, 
  LogOut, 
  Menu,
  Shield,
  FileText,
  Settings as SettingsIcon,
  Zap,
  HelpCircle,
  Info,
  Radio,
  Sparkles,
  CloudSun,
  Wallet,
  Bot,
  MapPinned,
  Wrench,
  Lock,
  Eye,
  X,
  List,
  Grid,
  BookOpen,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { getUnreadNotificationCount } from '@/db/api';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  category?: 'main' | 'community' | 'tools' | 'user' | 'system';
}

const NavItemComponent = memo(function NavItemComponent({ 
  item, 
  isActive, 
  isRestricted, 
  isMobile, 
  onItemClick 
}: { 
  item: NavItem; 
  isActive: boolean; 
  isRestricted: boolean;
  isMobile: boolean;
  onItemClick: () => void;
}) {
  const Icon = item.icon;
  
  return (
    <Link
      to={item.path}
      className={cn(
        "flex items-center gap-4 px-4 py-3 md-sys-shape-corner-lg",
        "md-sys-typescale-label-large transition-colors duration-150",
        isActive && "bg-[hsl(var(--md-sys-color-secondary-container))] text-[hsl(var(--md-sys-color-on-secondary-container))]",
        !isActive && "text-[hsl(var(--md-sys-color-on-surface-variant))]",
        isRestricted && "opacity-38 pointer-events-none"
      )}
      onClick={onItemClick}
      style={{ contain: 'layout style' }}
    >
      <Icon className="w-6 h-6 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {isRestricted && <Lock className="w-4 h-4" />}
      {!isRestricted && item.badge !== undefined && item.badge > 0 && (
        <Badge 
          variant="filledError" 
          className="h-5 min-w-5 px-1.5 md-sys-typescale-label-small md-sys-shape-corner-full"
        >
          {item.badge > 99 ? '99+' : item.badge}
        </Badge>
      )}
    </Link>
  );
});

interface NavContentProps {
  profile: { id: string; username?: string; role?: string; is_streamer?: boolean } | null;
  performanceMode: boolean;
  setPerformanceMode: (value: boolean) => void;
  handleLogout: () => void;
  navItems: NavItem[];
  isRestricted: (path: string) => boolean;
  isMobile: boolean;
  onNavItemClick: () => void;
  currentPath: string;
}

const NavContent = memo(function NavContent({
  profile,
  performanceMode,
  setPerformanceMode,
  handleLogout,
  navItems,
  isRestricted,
  isMobile,
  onNavItemClick,
  currentPath,
}: NavContentProps) {
  return (
    <div className="flex flex-col h-full" style={{ contain: 'layout style' }}>
      <div className="p-4 shrink-0">
        <div className="flex items-center gap-3 p-3 md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-primary-container))]">
          <div className="w-10 h-10 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-primary))] flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="HMNL" className="w-8 h-8 object-contain" loading="lazy" />
          </div>
          <div>
            <h1 className="md-sys-typescale-title-medium text-[hsl(var(--md-sys-color-on-primary-container))]">
              HMNL
            </h1>
            <p className="md-sys-typescale-label-small text-[hsl(var(--md-sys-color-on-primary-container)/0.7)]">
              直播 & 讨论站
            </p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
          {navItems.map((item) => (
            <NavItemComponent 
              key={item.path} 
              item={item}
              isActive={currentPath === item.path}
              isRestricted={isRestricted(item.path)}
              isMobile={isMobile}
              onItemClick={onNavItemClick}
            />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-[hsl(var(--md-sys-color-outline-variant))] space-y-4 shrink-0">
        <div className="flex items-center justify-between p-3 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest))]">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[hsl(var(--md-sys-color-tertiary))]" />
            <Label htmlFor="perf-mode" className="md-sys-typescale-label-large cursor-pointer">
              性能模式
            </Label>
          </div>
          <Switch
            id="perf-mode"
            checked={performanceMode}
            onCheckedChange={setPerformanceMode}
          />
        </div>
        
        <div className="flex items-center justify-between p-3 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest))]">
          <span className="md-sys-typescale-label-large">主题风格</span>
          <ThemeSwitcher />
        </div>
        
        <div className="flex items-center gap-3 p-3 md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container-high))]">
          <div className="w-10 h-10 md-sys-shape-corner-full bg-[hsl(var(--md-sys-color-primary))] flex items-center justify-center text-[hsl(var(--md-sys-color-on-primary))] md-sys-typescale-title-medium">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="md-sys-typescale-title-small truncate">{profile?.username || '用户'}</p>
            <p className="md-sys-typescale-label-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
              {profile?.role === 'admin' ? '管理员' : profile?.is_streamer ? '主播' : '普通用户'}
            </p>
          </div>
        </div>
        
        <Button
          variant="outlined"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );
});

const BottomNavItem = memo(function BottomNavItem({
  item,
  isActive,
  isRestricted,
  onClick,
}: {
  item: { path: string; icon: React.ElementType; label: string; badge?: number; isCenter?: boolean };
  isActive: boolean;
  isRestricted: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const Icon = item.icon;
  
  if (item.isCenter) {
    return (
      <Link
        to={item.path}
        className={cn(
          "bottom-nav-center-wrapper",
          isRestricted && "opacity-38 pointer-events-none"
        )}
        onClick={onClick}
        style={{ contain: 'layout style' }}
      >
        <div className="bottom-nav-center-btn">
          <Icon className="bottom-nav-center-icon text-[hsl(var(--md-sys-color-on-primary-container))]" />
        </div>
        <span className="bottom-nav-center-label">
          {item.label}
        </span>
      </Link>
    );
  }
  
  return (
    <Link
      to={item.path}
      className={cn(
        "bottom-nav-item",
        isActive ? "bottom-nav-item-active" : "bottom-nav-item-inactive",
        isRestricted && "opacity-38 pointer-events-none"
      )}
      onClick={onClick}
      style={{ contain: 'layout style' }}
    >
      <div className="bottom-nav-icon-wrapper">
        <Icon className={cn(
          "bottom-nav-icon",
          isActive 
            ? "text-[hsl(var(--md-sys-color-on-secondary-container))]" 
            : "text-[hsl(var(--md-sys-color-on-surface-variant))]"
        )} />
        {!isRestricted && item.badge !== undefined && item.badge > 0 && (
          <div className="bottom-nav-badge">
            {item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>
      <span className={cn(
        "bottom-nav-label",
        isActive 
          ? "text-[hsl(var(--md-sys-color-on-secondary-container))]" 
          : "text-[hsl(var(--md-sys-color-on-surface-variant))]"
      )}>
        {item.label}
      </span>
    </Link>
  );
});

const BASE_NAV_ITEMS: NavItem[] = [
  { path: '/', icon: Home, label: '首页', category: 'main' },
  { path: '/broadcast', icon: Radio, label: '放送广场', category: 'main' },
  { path: '/posts', icon: FileText, label: '帖子', category: 'community' },
  { path: '/forum', icon: Sparkles, label: '幻霜论坛lite', category: 'community' },
  { path: '/chat', icon: MessageSquare, label: '聊天室', category: 'community' },
  { path: '/channels', icon: Radio, label: '直播', category: 'community' },
  { path: '/ai-chat', icon: Bot, label: 'AI助手', category: 'tools' },
  { path: '/map', icon: MapPinned, label: '地图', category: 'tools' },
  { path: '/animas-tools', icon: Wrench, label: '工具', category: 'tools' },
  { path: '/weather', icon: CloudSun, label: '天气', category: 'tools' },
  { path: '/subscription-wallet', icon: Wallet, label: '钱包', category: 'user' },
  { path: '/my-broadcast', icon: Grid, label: '我的放送', category: 'user' },
  { path: '/create-post', icon: PenSquare, label: '发布', category: 'user' },
  { path: '/notifications', icon: Bell, label: '通知', category: 'user' },
  { path: '/profile', icon: User, label: '我的', category: 'user' },
  { path: '/help', icon: HelpCircle, label: '帮助', category: 'system' },
  { path: '/docs', icon: BookOpen, label: '文档中心', category: 'system' },
  { path: '/about', icon: Info, label: '关于', category: 'system' },
  { path: '/settings', icon: SettingsIcon, label: '设置', category: 'system' },
];

const BOTTOM_NAV_ITEMS = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/broadcast', icon: Radio, label: '放送' },
  { path: '/channels', icon: List, label: '频道列表', isCenter: true },
  { path: '/forum', icon: MessageSquare, label: '幻霜论坛Lite' },
  { path: '/profile', icon: User, label: '我的' },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const { profile, signOut, isGuestMode, exitGuestMode } = useAuth();
  const { performanceMode, setPerformanceMode } = usePerformanceMode();
  const { isMobile, isFAHMNL } = useDevice();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldUseMobileView = isMobile || isFAHMNL;
  const shouldHideBottomNav = isFAHMNL;
  const shouldHideSidebarTrigger = isFAHMNL;

  const navItems = useMemo(() => {
    const items = [...BASE_NAV_ITEMS];
    
    if (profile?.is_streamer) {
      items.splice(5, 0, { path: '/live-management', icon: Radio, label: '直播管理', category: 'community' });
    }
    
    if (profile?.role === 'admin') {
      items.push({ path: '/admin', icon: Shield, label: '管理后台', category: 'system' });
    }
    
    return items;
  }, [profile?.is_streamer, profile?.role]);

  const bottomNavItemsWithBadge = useMemo(() => {
    return BOTTOM_NAV_ITEMS.map(item => 
      item.path === '/forum' ? { ...item, badge: unreadCount } : item
    );
  }, [unreadCount]);

  const isRestricted = useCallback((path: string) => {
    return isGuestMode && (
      path === '/chat' || path === '/create-post' || path === '/ai-chat' ||
      path === '/subscription-wallet' || path === '/my-broadcast' || path === '/notifications' ||
      path === '/profile' || path === '/admin' || path === '/reports' || path === '/live-management' ||
      path === '/broadcast/create' || path === '/broadcast/:id/edit'
    );
  }, [isGuestMode]);

  const handleLogout = useCallback(async () => {
    await signOut();
    if (isGuestMode) {
      exitGuestMode();
    }
    navigate('/login');
  }, [signOut, isGuestMode, exitGuestMode, navigate]);

  const handleNavItemClick = useCallback(() => {
    if (isMobile) {
      setSheetOpen(false);
    }
  }, [isMobile]);

  const handleBottomNavClick = useCallback((e: React.MouseEvent, path: string) => {
    if (isRestricted(path)) {
      e.preventDefault();
    }
  }, [isRestricted]);

  useEffect(() => {
    if (profile) {
      getUnreadNotificationCount(profile.id).then(setUnreadCount);
      const interval = setInterval(() => {
        getUnreadNotificationCount(profile.id).then(setUnreadCount);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  useEffect(() => {
    const checkDeviceType = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const width = window.innerWidth;
      
      if (isTouchDevice && width >= 768 && width < 1024) {
        document.documentElement.setAttribute('data-device-type', 'tablet');
      } else {
        document.documentElement.removeAttribute('data-device-type');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return (
    <>
      <PopupAnnouncementDialog />
      
      <div 
        ref={containerRef}
        className="fixed-width-container min-h-screen"
      >
        <div className="flex min-h-screen w-full">
          {!shouldUseMobileView && (
            <aside className="w-72 shrink-0 h-screen sticky top-0 overflow-hidden glass-sidebar">
              <NavContent
                profile={profile}
                performanceMode={performanceMode}
                setPerformanceMode={setPerformanceMode}
                handleLogout={handleLogout}
                navItems={navItems}
                isRestricted={isRestricted}
                isMobile={isMobile}
                onNavItemClick={handleNavItemClick}
                currentPath={location.pathname}
              />
            </aside>
          )}

          {shouldUseMobileView && !shouldHideSidebarTrigger && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="icon"
                  size="icon"
                  className="fixed top-4 left-4 z-40 glass-button md-sys-elevation-2"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="p-0 w-72 flex flex-col overflow-hidden glass-sidebar"
              >
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--md-sys-color-outline-variant)/0.2)] shrink-0">
                  <span className="md-sys-typescale-title-medium">导航菜单</span>
                  <Button variant="icon" size="icon-sm" onClick={() => setSheetOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <NavContent
                  profile={profile}
                  performanceMode={performanceMode}
                  setPerformanceMode={setPerformanceMode}
                  handleLogout={handleLogout}
                  navItems={navItems}
                  isRestricted={isRestricted}
                  isMobile={isMobile}
                  onNavItemClick={handleNavItemClick}
                  currentPath={location.pathname}
                />
              </SheetContent>
            </Sheet>
          )}

          <main className={cn(
            "flex-1 min-w-0 overflow-y-auto bg-[hsl(var(--md-sys-color-background))]",
            shouldUseMobileView ? 'pt-16 pb-20' : '',
            shouldHideBottomNav && 'pb-0'
          )}>
            {isGuestMode && (
              <div className="sticky top-0 z-40 bg-[hsl(var(--md-sys-color-tertiary-container))] border-b border-[hsl(var(--md-sys-color-outline-variant))]">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-[hsl(var(--md-sys-color-on-tertiary-container))]" />
                    <div>
                      <p className="md-sys-typescale-title-small text-[hsl(var(--md-sys-color-on-tertiary-container))]">访客模式</p>
                      <p className="md-sys-typescale-label-small text-[hsl(var(--md-sys-color-on-tertiary-container)/0.7)]">注册解锁完整功能</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    登录/注册
                  </Button>
                </div>
              </div>
            )}
            
            <div className="w-full">
              {children}
            </div>
          </main>

          {shouldUseMobileView && !shouldHideBottomNav && (
            <nav className="glass-bottombar">
              <div className="bottom-nav-container">
                {bottomNavItemsWithBadge.map((item) => (
                  <BottomNavItem
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                    isRestricted={isRestricted(item.path)}
                    onClick={(e) => handleBottomNavClick(e, item.path)}
                  />
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
