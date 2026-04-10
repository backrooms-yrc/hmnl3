import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSidebarPreloadReturn {
  isPreloaded: boolean;
  shouldRenderContent: boolean;
  triggerPreload: () => void;
}

const useSidebarPreload = (isOpen: boolean): UseSidebarPreloadReturn => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [shouldRenderContent, setShouldRenderContent] = useState(false);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const triggerPreload = useCallback(() => {
    if (!isPreloaded) {
      setIsPreloaded(true);
    }
  }, [isPreloaded]);

  useEffect(() => {
    if (isOpen) {
      if (!shouldRenderContent) {
        setShouldRenderContent(true);
      }
      if (!isPreloaded) {
        setIsPreloaded(true);
      }
    } else {
      if (shouldRenderContent) {
        const rafId = requestAnimationFrame(() => {
          if (!isOpenRef.current) {
            setShouldRenderContent(false);
          }
        });
        return () => cancelAnimationFrame(rafId);
      }
    }
  }, [isOpen]);

  return { isPreloaded, shouldRenderContent, triggerPreload };
};

export default useSidebarPreload;
