// lib/message-animations.ts
import type { Variants } from "motion/react";

export const MESSAGE_ANIMATIONS = {
  "slide-up": {
    variants: {
      initial: { opacity: 0, y: 12, scale: 0.97 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 420,
          damping: 32,
        },
      },
    } satisfies Variants,
  },
} as const;
