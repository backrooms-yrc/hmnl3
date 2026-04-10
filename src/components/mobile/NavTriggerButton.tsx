import { memo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface NavTriggerButtonProps {
  onClick: () => void;
  isActive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'solid';
}

const NavTriggerButton = memo(function NavTriggerButton({
  onClick,
  isActive = false,
  className,
  size = 'md',
  variant = 'glass',
}: NavTriggerButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const createRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const button = buttonRef.current;
    const ripple = rippleRef.current;
    if (!button || !ripple) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event as React.MouseEvent).clientX ?? 
                (event as React.TouchEvent).touches?.[0]?.clientX ??
                rect.left + rect.width / 2;
    const y = (event as React.MouseEvent).clientY ?? 
                (event as React.TouchEvent).touches?.[0]?.clientY ??
                rect.top + rect.height / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - rect.left - size / 2}px`;
    ripple.style.top = `${y - rect.top - size / 2}px`;
    ripple.classList.add('nav-trigger-ripple-active');

    setTimeout(() => {
      ripple.classList.remove('nav-trigger-ripple-active');
    }, 600);
  }, []);

  const handlePressStart = useCallback(() => {
    if (!buttonRef.current) return;
    
    buttonRef.current.style.transform = 'scale(0.88)';
    buttonRef.current.style.transition = 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)';

    pressTimerRef.current = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.style.transform = 'scale(0.85)';
        buttonRef.current.style.transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)';
      }
    }, 150);
  }, []);

  const handlePressEnd = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }

    if (!buttonRef.current) return;

    requestAnimationFrame(() => {
      if (buttonRef.current) {
        buttonRef.current.style.transform = 'scale(1.02)';
        buttonRef.current.style.transition = 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.transform = 'scale(1)';
            buttonRef.current.style.transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)';
          }
        }, 150);
      }
    });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    createRipple(e);
    
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'scale(1)';
    }

    onClick();
  }, [onClick, createRipple]);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={(e) => handleClick(e)}
      onTouchStart={() => handlePressStart()}
      onTouchEnd={() => handlePressEnd()}
      onMouseDown={() => handlePressStart()}
      onMouseUp={() => handlePressEnd()}
      onMouseLeave={() => handlePressEnd()}
      className={cn(
        "relative overflow-hidden nav-trigger-button",
        "flex items-center justify-center",
        "rounded-full font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "transition-all duration-200 ease-out",
        "active:scale-95",
        sizeClasses[size],
        className
      )}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      aria-label={isActive ? "关闭导航菜单" : "打开导航菜单"}
      aria-expanded={isActive}
    >
      {/* 涟漪效果 */}
      <span
        ref={rippleRef}
        className="absolute rounded-full bg-white/30 nav-trigger-ripple"
        style={{
          transform: 'scale(0)',
          pointerEvents: 'none',
        }}
      />

      {/* 汉堡菜单图标 */}
      <svg
        className={cn("nav-trigger-icon", iconSizes[size])}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      >
        <line x1="3" y1="6" x2="21" y2="6" 
              style={{
                transformOrigin: 'center',
                transform: isActive ? 'translateY(8px) rotate(45deg)' : 'none',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
        <line x1="3" y1="12" x2="21" y2="12" 
              style={{
                opacity: isActive ? 0 : 1,
                transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
        <line x1="3" y1="18" x2="21" y2="18" 
              style={{
                transformOrigin: 'center',
                transform: isActive ? 'translateY(-8px) rotate(-45deg)' : 'none',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
      </svg>
    </button>
  );
});

NavTriggerButton.displayName = 'NavTriggerButton';

export default NavTriggerButton;