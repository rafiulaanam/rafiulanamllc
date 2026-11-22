'use client';

import { useEffect, useRef } from 'react';

export function MarketCount({value}: {value:number}) {
  const digits = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = digits.current;
    if (!node || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      function tick(time: number) {
        const progress = Math.min((time - start) / 720,1);
        const number = Math.round(value * (1 - (1 - progress) ** 3));
        if (node) node.textContent = String(number).padStart(2,'0');
        if (progress < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    },{threshold:.3});
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  },[value]);
  return <><span className="sr-only">{value}</span><span ref={digits} aria-hidden="true">{String(value).padStart(2,'0')}</span></>;
}
