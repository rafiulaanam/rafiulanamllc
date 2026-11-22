'use client';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const ready = () => true;
const waiting = () => false;

export function useHydrated() {
  return useSyncExternalStore(subscribe, ready, waiting);
}