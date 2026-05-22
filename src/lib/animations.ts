// Premium Editorial Animation System
// Inspired by DAZED / i-D / 032c / Hypebeast

import { Variants, Transition } from "framer-motion";

// Timing Scales (Swedish restraint)
export const timing = {
  fast: 0.2,
  medium: 0.4,
  slow: 0.7,
  cinematic: 1.0,
} as const;

// Easing Curves (Editorial feel)
export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const,
  editorial: [0.25, 0.46, 0.45, 0.94] as const,
  entrance: [0.0, 0.0, 0.2, 1] as const,
  exit: [0.4, 0.0, 1, 1] as const,
};

// Default transition
export const defaultTransition: Transition = {
  duration: timing.slow,
  ease: easing.editorial,
};

// Animation Variants
export const fadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: timing.slow,
      ease: easing.editorial,
    }
  },
};

export const fadeIn: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: timing.medium,
      ease: easing.smooth,
    }
  },
};

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -60 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: timing.slow,
      ease: easing.editorial,
    }
  },
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 60 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: timing.slow,
      ease: easing.editorial,
    }
  },
};

export const scaleReveal: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 1.1 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: timing.cinematic,
      ease: easing.editorial,
    }
  },
};

export const maskReveal: Variants = {
  hidden: { 
    clipPath: "inset(100% 0% 0% 0%)" 
  },
  visible: { 
    clipPath: "inset(0% 0% 0% 0%)",
    transition: {
      duration: timing.slow,
      ease: easing.editorial,
    }
  },
};

// Stagger Container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: timing.medium,
      ease: easing.editorial,
    }
  },
};

// Page Transition Variants
export const pageTransition: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: timing.medium,
      ease: easing.editorial,
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: timing.fast,
      ease: easing.exit,
    }
  },
};

// Hover animations
export const hoverLift = {
  y: -4,
  transition: { duration: timing.fast, ease: easing.smooth },
};

export const hoverScale = {
  scale: 1.02,
  transition: { type: "spring" as const, stiffness: 400, damping: 20 },
};

export const tapScale = {
  scale: 0.98,
};

// Text reveal for word-by-word animation
export const wordReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const wordItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    rotateX: -90,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    rotateX: 0,
    transition: {
      duration: timing.medium,
      ease: easing.editorial,
    }
  },
};

// SVG stroke draw animation
export const strokeDraw: Variants = {
  hidden: { 
    pathLength: 0,
    opacity: 0 
  },
  visible: { 
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: timing.medium,
        ease: easing.editorial,
      },
      opacity: {
        duration: 0.01,
      }
    }
  },
};
