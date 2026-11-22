'use client';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
export function HeroCopy({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div className="hero-copy" initial={false} animate={reduced ? {} : { y: [8, 0] }} transition={{duration: .55, ease: 'easeOut'}}>{children}</motion.div>;
}