import { ReactNode, memo, useEffect, useState, useRef } from 'react';

interface SidebarTransitionProps {
  children: ReactNode;
  isOpen: boolean;
  side?: 'left' | 'right';
}

const OverlayComponent = memo(function OverlayComponent() {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40"
      style={{
        willChange: 'opacity',
        contain: 'strict',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        transition: 'opacity 100ms cubic-bezier(0.2, 0, 0, 1)',
      }}
    />
  );
});

const SidebarPanel = memo(function SidebarPanel({
  children,
  side,
}: {
  children: ReactNode;
  side: 'left' | 'right';
}) {
  return (
    <div
      className={`
        fixed ${side === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 z-50
        w-72 overflow-hidden
        sidebar-mobile
      `}
      style={{
        willChange: 'transform',
        contain: 'layout style paint',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        transition: 'transform 100ms cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {children}
    </div>
  );
});

export const SidebarTransition = memo(function SidebarTransition({
  children,
  isOpen,
  side = 'left',
}: SidebarTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = undefined;
      }
      setShouldMount(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      closeTimerRef.current = setTimeout(() => {
        setShouldMount(false);
      }, 100);
    }

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [isOpen]);

  if (!shouldMount) return null;

  const translateX = side === 'left' ? '-100%' : '100%';

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        style={{
          willChange: 'opacity',
          contain: 'strict',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 100ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      />
      <div
        className={`
          fixed ${side === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 z-50
          w-72 overflow-hidden
          sidebar-mobile
        `}
        style={{
          willChange: 'transform',
          contain: 'layout style paint',
          transform: isVisible ? 'translateX(0) translateZ(0)' : `translateX(${translateX}) translateZ(0)`,
          backfaceVisibility: 'hidden',
          transition: 'transform 100ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {children}
      </div>
    </>
  );
});

export const SidebarContentTransition = memo(function SidebarContentTransition({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="h-full flex flex-col"
      style={{ contain: 'layout style' }}
    >
      {children}
    </div>
  );
});

export const SidebarItemTransition = memo(function SidebarItemTransition({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{ contain: 'layout style' }}>
      {children}
    </div>
  );
});
