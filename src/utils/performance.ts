export const MD3_EASING = {
  linear: 'linear' as const,
  standard: 'linear' as const,
  standardAccelerate: 'linear' as const,
  standardDecelerate: 'linear' as const,
  emphasized: 'linear' as const,
  emphasizedAccelerate: 'linear' as const,
  emphasizedDecelerate: 'linear' as const,
};

export const MD3_DURATION = {
  short1: 50,
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  long3: 550,
  long4: 600,
};

export const MD3_DURATION_SECONDS = {
  short1: 0.05,
  short2: 0.1,
  short3: 0.15,
  short4: 0.2,
  medium1: 0.25,
  medium2: 0.3,
  medium3: 0.35,
  medium4: 0.4,
  long1: 0.45,
  long2: 0.5,
  long3: 0.55,
  long4: 0.6,
};

export function getOptimizedTransition(
  property: string = 'all',
  duration: number = MD3_DURATION.medium1,
  easing: string = MD3_EASING.linear
): string {
  return `${property} ${duration}ms ${easing}`;
}

export function createSpringTransition(): { type: 'tween'; duration: number; ease: string } {
  return {
    type: 'tween',
    duration: MD3_DURATION_SECONDS.medium2,
    ease: MD3_EASING.linear,
  };
}

export function getMotionConfig(performanceMode: boolean) {
  if (performanceMode) {
    return {
      transition: { duration: 0 },
      animate: {},
    };
  }
  
  return {
    transition: {
      duration: MD3_DURATION_SECONDS.medium2,
      ease: MD3_EASING.linear,
    },
  };
}

export function getAnimationVariants(performanceMode: boolean) {
  if (performanceMode) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }
  
  return {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: MD3_DURATION_SECONDS.short4, ease: MD3_EASING.linear }
    },
    exit: { 
      opacity: 0,
      transition: { duration: MD3_DURATION_SECONDS.short3, ease: MD3_EASING.linear }
    },
  };
}

export function getSlideVariants(performanceMode: boolean, direction: number = 1) {
  if (performanceMode) {
    return {
      initial: { opacity: 1, x: 0 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 1, x: 0 },
    };
  }
  
  return {
    initial: { opacity: 0, x: direction > 0 ? 30 : -30 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: MD3_DURATION_SECONDS.medium2, ease: MD3_EASING.linear }
    },
    exit: { 
      opacity: 0, 
      x: direction > 0 ? -20 : 20,
      transition: { duration: MD3_DURATION_SECONDS.short4, ease: MD3_EASING.linear }
    },
  };
}

export function getScaleVariants(performanceMode: boolean) {
  if (performanceMode) {
    return {
      initial: { opacity: 1, scale: 1 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 1, scale: 1 },
    };
  }
  
  return {
    initial: { opacity: 0, scale: 0.96 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: MD3_DURATION_SECONDS.medium1, ease: MD3_EASING.linear }
    },
    exit: { 
      opacity: 0, 
      scale: 0.96,
      transition: { duration: MD3_DURATION_SECONDS.short3, ease: MD3_EASING.linear }
    },
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  return ((...args: unknown[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export function requestIdleCallbackPolyfill(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  const start = Date.now();
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1);
}

export function cancelIdleCallbackPolyfill(id: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

export function prefetchResource(href: string, as: 'script' | 'style' | 'image' | 'font'): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

export function preloadResource(href: string, as: 'script' | 'style' | 'image' | 'font'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}
