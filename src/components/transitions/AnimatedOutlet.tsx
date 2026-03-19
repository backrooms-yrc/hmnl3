import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useOutlet } from 'react-router-dom';
import { useMemo, useRef, useEffect } from 'react';
import { usePerformanceMode } from '@/contexts/PerformanceModeContext';

type TransitionType = 'fade' | 'slide' | 'scale' | 'none';

interface TransitionConfig {
  type: TransitionType;
  direction?: number;
}

const transitionConfigs: Record<string, TransitionConfig> = {
  '/': { type: 'fade' },
  '/posts': { type: 'slide', direction: 1 },
  '/channels': { type: 'slide', direction: 1 },
  '/forum': { type: 'slide', direction: 1 },
  '/broadcast': { type: 'slide', direction: 1 },
  '/profile': { type: 'scale' },
  '/settings': { type: 'scale' },
  '/notifications': { type: 'slide', direction: -1 },
  '/ai-chat': { type: 'fade' },
};

function getTransitionConfig(pathname: string): TransitionConfig {
  const basePath = '/' + pathname.split('/')[1];
  return transitionConfigs[basePath] || { type: 'fade' };
}

const MD3_EASING = {
  standard: [0.2, 0, 0, 1] as const,
  standardAccelerate: [0.3, 0, 1, 1] as const,
  standardDecelerate: [0, 0, 0, 1] as const,
  linear: [0, 0, 1, 1] as const,
};

const MD3_DURATION = {
  short2: 0.1,
  short3: 0.15,
  short4: 0.2,
  medium1: 0.25,
  medium2: 0.3,
  medium3: 0.35,
  medium4: 0.4,
};

const variants = {
  fade: {
    initial: { opacity: 0 },
    enter: { 
      opacity: 1,
      transition: { 
        duration: MD3_DURATION.short4, 
        ease: MD3_EASING.standardDecelerate 
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: MD3_DURATION.short3, 
        ease: MD3_EASING.standardAccelerate 
      }
    },
  },
  slide: {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 30 : -30,
    }),
    enter: {
      opacity: 1,
      x: 0,
      transition: { 
        duration: MD3_DURATION.medium2, 
        ease: MD3_EASING.standardDecelerate 
      }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -20 : 20,
      transition: { 
        duration: MD3_DURATION.short4, 
        ease: MD3_EASING.standardAccelerate 
      }
    }),
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    enter: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: MD3_DURATION.medium1, 
        ease: MD3_EASING.standardDecelerate 
      }
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: { 
        duration: MD3_DURATION.short3, 
        ease: MD3_EASING.standardAccelerate 
      }
    },
  },
  none: {
    initial: { opacity: 1 },
    enter: { opacity: 1 },
    exit: { opacity: 1 },
  },
};

export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const prevPathnameRef = useRef<string>(location.pathname);
  const directionRef = useRef<number>(1);
  const { performanceMode } = usePerformanceMode();

  useEffect(() => {
    const prevPath = prevPathnameRef.current;
    const currentPath = location.pathname;
    
    const prevDepth = prevPath.split('/').length;
    const currentDepth = currentPath.split('/').length;
    
    directionRef.current = currentDepth > prevDepth ? 1 : -1;
    prevPathnameRef.current = currentPath;
  }, [location.pathname]);

  const config = useMemo(() => {
    if (performanceMode) {
      return { type: 'none' as TransitionType };
    }
    return getTransitionConfig(location.pathname);
  }, [location.pathname, performanceMode]);
  
  const currentVariants = useMemo(() => {
    return variants[config.type];
  }, [config.type]);

  const custom = useMemo(() => {
    return config.type === 'slide' ? (config.direction ?? directionRef.current) : 0;
  }, [config.type, config.direction]);

  if (performanceMode) {
    return <div className="w-full h-full">{outlet}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false} custom={custom}>
      <motion.div
        key={location.pathname}
        custom={custom}
        variants={currentVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="w-full h-full"
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          contain: 'layout style paint',
        }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="relative w-full flex-1 overflow-hidden"
      style={{ 
        contain: 'layout style',
        contentVisibility: 'auto',
      }}
    >
      {children}
    </div>
  );
}

export { variants, transitionConfigs, getTransitionConfig, MD3_EASING, MD3_DURATION };
export type { TransitionType, TransitionConfig };
