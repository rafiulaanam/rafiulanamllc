"use client";

import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "motion/react";
import { CartDrawerProvider } from "@/components/storefront/CartDrawerContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {/* "user" respects prefers-reduced-motion automatically for every animation below */}
      <MotionConfig reducedMotion="user">
        <CartDrawerProvider>{children}</CartDrawerProvider>
      </MotionConfig>
    </SessionProvider>
  );
}
