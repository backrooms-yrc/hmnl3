import { ReactNode, memo } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransitionWrapper = memo(function PageTransitionWrapper({ 
  children 
}: PageTransitionProps) {
  return (
    <div 
      className="relative w-full flex-1 overflow-hidden"
      style={{ contain: 'layout style' }}
    >
      {children}
    </div>
  );
});
