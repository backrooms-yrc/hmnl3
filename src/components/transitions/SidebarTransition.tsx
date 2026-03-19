import { motion, AnimatePresence } from 'motion/react';
import { ReactNode, memo } from 'react';
import { sidebarVariants, overlayVariants, contentVariants, itemVariants } from './sidebarVariants';

interface SidebarTransitionProps {
  children: ReactNode;
  isOpen: boolean;
  side?: 'left' | 'right';
}

const OverlayComponent = memo(function OverlayComponent() {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={overlayVariants}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
      style={{ 
        willChange: 'opacity',
        contain: 'strict',
      }}
    />
  );
});

const SidebarPanel = memo(function SidebarPanel({ 
  children, 
  side 
}: { 
  children: ReactNode; 
  side: 'left' | 'right'; 
}) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={sidebarVariants}
      custom={side}
      className={`
        fixed ${side === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 z-50
        w-72 overflow-hidden
        glass-sidebar
      `}
      style={{ 
        willChange: 'transform, opacity',
        contain: 'layout style paint',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
});

export const SidebarTransition = memo(function SidebarTransition({ 
  children, 
  isOpen, 
  side = 'left' 
}: SidebarTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <OverlayComponent />
          <SidebarPanel side={side}>{children}</SidebarPanel>
        </>
      )}
    </AnimatePresence>
  );
});

export const SidebarContentTransition = memo(function SidebarContentTransition({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={contentVariants}
      className="h-full flex flex-col"
      style={{ contain: 'layout style' }}
    >
      {children}
    </motion.div>
  );
});

export const SidebarItemTransition = memo(function SidebarItemTransition({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <motion.div 
      variants={itemVariants}
      style={{ contain: 'layout style' }}
    >
      {children}
    </motion.div>
  );
});
