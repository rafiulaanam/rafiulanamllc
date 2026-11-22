'use client';

import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useHydrated } from '@/lib/hydration';

export function EarthBackdrop({ marketSlugs }: { marketSlugs: string[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const hydrated = useHydrated();

  useEffect(() => {
    const host = stage.current;
    if (!host || paused) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator as Navigator & {connection?: {saveData?: boolean}};
    let dispose: (() => void) | undefined;
    let pending: AbortController | undefined;
    let idle = 0;
    let timer = 0;
    let active = true;

    function stop() {
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      idle = 0;
      pending?.abort();
      pending = undefined;
      dispose?.();
      dispose = undefined;
    }

    function start() {
      idle = 0;
      timer = 0;
      if (!active || !host || pending || dispose || document.hidden || preference.matches) return;
      const controller = new AbortController();
      pending = controller;
      import('./earth-scene').then(async scene => {
        if (controller.signal.aborted) return;
        const cleanup = await scene.mountEarth(host, controller.signal, marketSlugs);
        if (controller.signal.aborted) cleanup?.();
        else dispose = cleanup;
      }).catch(() => {
        // The poster remains visible if WebGL or a texture cannot load.
      }).finally(() => {
        if (pending === controller) pending = undefined;
      });
    }

    function schedule() {
      if (preference.matches || connection.connection?.saveData || navigator.hardwareConcurrency <= 2) return;
      if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(start, {timeout:1200});
      else timer = window.setTimeout(start, 250);
    }

    function onPreference() {
      stop();
      schedule();
    }

    function onVisibility() {
      if (!document.hidden && !pending && !dispose && !idle && !timer) schedule();
    }

    schedule();
    preference.addEventListener('change',onPreference);
    document.addEventListener('visibilitychange',onVisibility);
    return () => {
      active = false;
      preference.removeEventListener('change',onPreference);
      document.removeEventListener('visibilitychange',onVisibility);
      stop();
    };
  }, [paused, marketSlugs]);

  return <>
    <div className="earth-stage" ref={stage} aria-hidden="true" data-earth-stage>
      <div className="earth-stars" />
      <div className="earth-poster">
        <Image src="/media/earth/poster.webp" alt="" fill priority sizes="(max-width: 760px) 76vh, 86vh" />
      </div>
    </div>
    {hydrated && <button className="motion-toggle" type="button" onClick={() => setPaused(value => !value)}
      aria-label={paused ? 'Resume background motion' : 'Pause background motion'}>
      {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      <span>{paused ? 'Resume motion' : 'Pause motion'}</span>
    </button>}
  </>;
}
