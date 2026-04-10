export const sidebarVariants = {
  initial: (side: 'left' | 'right') => ({
    opacity: 0,
    transform: `translateX(${side === 'left' ? -280 : 280}px) translateZ(0)`,
  }),
  enter: {
    opacity: 1,
    transform: 'translateX(0) translateZ(0)',
    transition: {
      type: 'tween',
      duration: 0.1,
      ease: [0.2, 0, 0, 1],
    },
  },
  exit: (side: 'left' | 'right') => ({
    opacity: 0,
    transform: `translateX(${side === 'left' ? -280 : 280}px) translateZ(0)`,
    transition: {
      type: 'tween',
      duration: 0.08,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

export const overlayVariants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.1,
      ease: [0.2, 0, 0, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.08,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const contentVariants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.1,
      ease: [0.2, 0, 0, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.06,
    },
  },
};

export const itemVariants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.08,
      ease: [0.2, 0, 0, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.04,
    },
  },
};
