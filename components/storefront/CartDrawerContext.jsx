"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartDrawerContext = createContext(null);

export function CartDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  // Called after any cart mutation so the drawer/badge refetch even though
  // they're client components that don't re-render from router.refresh().
  const bump = useCallback(() => setRefreshToken((t) => t + 1), []);

  const value = useMemo(
    () => ({ isOpen, open, close, refreshToken, bump }),
    [isOpen, open, close, refreshToken, bump]
  );

  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used within CartDrawerProvider");
  return ctx;
}
