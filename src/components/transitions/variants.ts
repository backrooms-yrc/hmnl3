export const pageVariants = {
  initial: {
    opacity: 0,
    transform: 'translateX(20px) scale(0.98)',
  },
  enter: {
    opacity: 1,
    transform: 'translateX(0) scale(1)',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    transform: 'translateX(-20px) scale(0.98)',
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const slideVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    transform: `translateX(${direction > 0 ? 100 : -100}px)`,
  }),
  enter: {
    opacity: 1,
    transform: 'translateX(0)',
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    transform: `translateX(${direction > 0 ? -100 : 100}px)`,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export const fadeVariants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

export const routeTransitionConfig: Record<string, { type: 'slide' | 'fade' | 'scale'; direction?: number }> = {
  '/': { type: 'fade' },
  '/posts': { type: 'slide', direction: 1 },
  '/channels': { type: 'slide', direction: 1 },
  '/worldview': { type: 'slide', direction: 1 },
  '/broadcast': { type: 'slide', direction: 1 },
  '/profile': { type: 'scale' },
  '/settings': { type: 'scale' },
  '/notifications': { type: 'slide', direction: -1 },
  '/ai-chat': { type: 'fade' },
};

export function getTransitionType(pathname: string) {
  const basePath = pathname.split('/').slice(0, 2).join('/') || pathname;
  return routeTransitionConfig[basePath] || { type: 'fade' };
}
