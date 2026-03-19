export const sidebarVariants = {
  initial: (side: 'left' | 'right') => ({
    opacity: 0,
    transform: `translateX(${side === 'left' ? -280 : 280}px) translateZ(0)`,
  }),
  enter: {
    opacity: 1,
    transform: 'translateX(0) translateZ(0)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
      mass: 0.5,
    },
  },
  exit: (side: 'left' | 'right') => ({
    opacity: 0,
    transform: `translateX(${side === 'left' ? -280 : 280}px) translateZ(0)`,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 40,
      mass: 0.4,
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
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

export const contentVariants = {
  initial: {
    opacity: 0,
    transform: 'translateY(10px)',
  },
  enter: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: {
      delay: 0.05,
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    transform: 'translateY(-5px)',
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

export const itemVariants = {
  initial: {
    opacity: 0,
    transform: 'translateX(-10px)',
  },
  enter: {
    opacity: 1,
    transform: 'translateX(0)',
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    transform: 'translateX(10px)',
    transition: {
      duration: 0.08,
    },
  },
};
