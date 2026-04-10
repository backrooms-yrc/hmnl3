import { ReactNode, memo, useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MobileNavDrawerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  width?: number | string;
  overlayOpacity?: number;
  animationDuration?: number;
  dragThreshold?: number;
  edgeWidth?: number;
  enableEdgeSwipe?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
  isOpening: boolean;
}

const MobileNavDrawer = memo(function MobileNavDrawer({
  children,
  isOpen,
  onClose,
  side = 'left',
  width = 288,
  overlayOpacity = 0.6,
  animationDuration = 300,
  dragThreshold = 100,
  edgeWidth = 20,
  enableEdgeSwipe = true,
}: MobileNavDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    isOpening: false,
  });
  const animationFrameRef = useRef<number>();

  const isLeftSide = side === 'left';

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setDragOffset(0);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else if (isVisible) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setDragOffset(0);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible, animationDuration]);

  const getTransformValue = useCallback((offset: number, animated: boolean) => {
    const widthPx = typeof width === 'string' ? parseInt(width) : width;
    
    if (animated || (!touchState.current.isDragging && offset === 0)) {
      return isLeftSide ? 'translateX(0)' : 'translateX(0)';
    }
    
    if (isLeftSide) {
      return `translateX(calc(-100% + ${offset}px))`;
    } else {
      return `translateX(calc(100% - ${offset}px))`;
    }
  }, [width, isLeftSide]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableEdgeSwipe && !isOpen) return;
    
    const touch = e.touches[0];
    const clientX = touch.clientX;
    
    if (!isOpen) {
      if (isLeftSide ? clientX > edgeWidth : clientX < window.innerWidth - edgeWidth) {
        return;
      }
    }

    touchState.current = {
      startX: clientX,
      startY: touch.clientY,
      currentX: clientX,
      isDragging: true,
      isOpening: !isOpen,
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [enableEdgeSwipe, isOpen, isLeftSide, edgeWidth]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.current.isDragging) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = Math.abs(touch.clientY - touchState.current.startY);

    if (Math.abs(deltaX) < 10) return;

    if (Math.abs(deltaY) > Math.abs(deltaX) * 2.5) {
      touchState.current.isDragging = false;
      return;
    }

    touchState.current.currentX = touch.clientX;
    
    let offset = Math.abs(deltaX);
    const widthPx = typeof width === 'string' ? parseInt(width) : width;
    
    if (offset > widthPx) {
      offset = widthPx;
    }

    if (touchState.current.isOpening) {
      if (isLeftSide && deltaX > 0) {
        setDragOffset(offset);
      } else if (!isLeftSide && deltaX < 0) {
        setDragOffset(offset);
      } else {
        touchState.current.isDragging = false;
      }
    } else {
      if (isLeftSide && deltaX < 0) {
        setDragOffset(widthPx - offset);
      } else if (!isLeftSide && deltaX > 0) {
        setDragOffset(widthPx - offset);
      } else {
        touchState.current.isDragging = false;
      }
    }
  }, [width, isLeftSide]);

  const handleTouchEnd = useCallback(() => {
    if (!touchState.current.isDragging) return;

    const widthPx = typeof width === 'string' ? parseInt(width) : width;
    const threshold = dragThreshold;
    const velocityThreshold = widthPx * 0.3;
    
    const shouldOpen = touchState.current.isOpening 
      ? dragOffset > threshold || dragOffset > velocityThreshold
      : dragOffset < widthPx - threshold && dragOffset < widthPx - velocityThreshold;

    if (shouldOpen && !isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else if (!shouldOpen && isOpen) {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, animationDuration);
    } else if (!shouldOpen && !isOpen) {
      setDragOffset(0);
    }

    touchState.current.isDragging = false;
    setDragOffset(0);
  }, [dragOffset, isOpen, onClose, dragThreshold, width, animationDuration]);

  const handleOverlayClick = useCallback(() => {
    if (isOpen || isVisible) {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, animationDuration);
    }
  }, [isOpen, isVisible, onClose, animationDuration]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleOverlayClick();
    }
  }, [handleOverlayClick]);

  if (!isVisible && !isOpen) return null;

  const widthPx = typeof width === 'string' ? parseInt(width) : width;
  const currentTransform = getTransformValue(dragOffset, isAnimating);

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {/* 遮罩层 */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black transition-opacity ease-out"
        style={{
          opacity: isAnimating ? overlayOpacity : 0,
          transitionDuration: `${animationDuration}ms`,
          pointerEvents: isAnimating ? 'auto' : 'none',
          zIndex: 40,
        }}
        onClick={handleOverlayClick}
        onTouchStart={(e) => {
          if (e.target === overlayRef.current) {
            handleOverlayClick();
          }
        }}
      />

      {/* 抽屉内容 */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 bottom-0 bg-white dark:bg-gray-900 overflow-hidden",
          "shadow-2xl",
          isLeftSide ? "left-0" : "right-0"
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          transform: currentTransform,
          transition: touchState.current.isDragging 
            ? 'none' 
            : `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          willChange: 'transform',
          contain: 'strict',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          WebkitOverflowScrolling: 'touch',
          zIndex: 50,
          touchAction: 'pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
});

MobileNavDrawer.displayName = 'MobileNavDrawer';

export default MobileNavDrawer;