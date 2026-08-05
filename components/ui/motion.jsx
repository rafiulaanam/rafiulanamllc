"use client";

import { motion } from "motion/react";

// Fades in + translates up slightly as it scrolls into view. Used for
// section-level entrances (hero copy, section headings).
export function FadeIn({ children, className, delay = 0, as = "div" }) {
  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </Component>
  );
}

// Wraps a grid of children so each item fades/translates in with a small
// stagger as the grid scrolls into view — the "considered" entrance for
// product grids called for in the design brief.
export function StaggerGrid({ children, className }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// A single staggered child — kept as its own client component so Server
// Component pages can compose it without importing `motion` themselves
// (motion.* elements require a client boundary).
export function StaggerItem({ children, className }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}
