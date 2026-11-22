'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Globe2, Radio } from 'lucide-react';
import { motion, useReducedMotion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { geographicMarkets } from '@/lib/business-markets';

type Venture = {
  slug:string; name:string; label:string; location:string; description:string;
  href:string; external:boolean;
};
function mapPoint(slug: string) {
  const market = geographicMarkets[slug];
  if (!market) return null;
  return {x:(market.longitude + 180) / 3.6,y:(90 - market.latitude) / 1.8};
}

export function EcosystemExplorer({ventures, company}: {ventures:Venture[];company:string}) {
  const [selected,setSelected] = useState(ventures[0]?.slug);
  const active = ventures.find(venture => venture.slug === selected) ?? ventures[0];
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(pointerX,{stiffness:170,damping:24});
  const rotateY = useSpring(pointerY,{stiffness:170,damping:24});

  useEffect(() => {
    function selectLinkedMarket(hash: string) {
      const prefix = '#market-';
      if (!hash.startsWith(prefix)) return;
      const slug = hash.slice(prefix.length);
      if (ventures.some(venture => venture.slug === slug)) setSelected(slug);
    }
    function readHash() { selectLinkedMarket(location.hash); }
    function handleRepeatedLink(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const href = event.target instanceof Element ? event.target.closest('a')?.getAttribute('href') : null;
      if (href === location.hash) selectLinkedMarket(href);
    }
    readHash();
    window.addEventListener('hashchange',readHash);
    document.addEventListener('click',handleRepeatedLink);
    return () => {
      window.removeEventListener('hashchange',readHash);
      document.removeEventListener('click',handleRepeatedLink);
    };
  }, [ventures]);

  if (!active) return null;

  return <div className="ecosystem-window" onPointerLeave={() => {
    pointerX.set(0);
    pointerY.set(0);
  }} onPointerMove={event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((.5 - (event.clientY - rect.top) / rect.height) * 5);
    pointerY.set(((event.clientX - rect.left) / rect.width - .5) * 6);
  }}>
    <motion.div className="ecosystem-surface" style={{rotateX,rotateY}}>
      <div className="ecosystem-bar"><span><Radio size={15} aria-hidden="true" /> Business network</span><span>{company}</span></div>
      <div className="ecosystem-columns">
        <div className="ecosystem-map" role="group" aria-label="Business markets">
          <div className="map-land" aria-hidden="true" />
          <svg className="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {ventures.map(venture => {
              const point = mapPoint(venture.slug);
              if (!point) return null;
              const {x,y} = point;
              return <path key={venture.slug} d={`M42,58 Q ${(42+x)/2},${y+5} ${x},${y}`} className={venture.slug === active.slug ? 'map-active' : undefined}/>;
            })}
            {ventures.some(venture => venture.slug === 'anamsoft') && <path d="M42,58 Q63,62 73,84"
              className={active.slug === 'anamsoft' ? 'map-active' : undefined} />}
          </svg>
          <span className="map-hub" aria-hidden="true"><span />{company}</span>
          {ventures.map(venture => {
            const point = mapPoint(venture.slug);
            if (!point) return null;
            return <button key={venture.slug} className="map-point" type="button" aria-label={'Select ' + venture.location}
              aria-pressed={active.slug === venture.slug} onClick={() => setSelected(venture.slug)}
              style={{left:point.x + '%',top:point.y + '%'}}><span /><span className="sr-only">{venture.location}</span></button>;
          })}
          {ventures.some(venture => venture.slug === 'anamsoft') && <button className="remote-market" type="button"
            aria-pressed={active.slug === 'anamsoft'} onClick={() => setSelected('anamsoft')}>
            <Globe2 size={14} aria-hidden="true" /> International / Remote
          </button>}
        </div>
        <div className="ecosystem-controls">
          <div className="ecosystem-choices" role="group" aria-label="Choose a venture">
            {ventures.map(venture => <button id={'market-' + venture.slug} type="button" key={venture.slug}
              aria-pressed={active.slug === venture.slug} onClick={() => setSelected(venture.slug)}>
              {venture.label}<ArrowDownRight size={16} aria-hidden="true" />
            </button>)}
          </div>
          <div className="ecosystem-detail" aria-live="polite" aria-atomic="true">
            <p className="eyebrow">{active.location}</p>
            <h3>{active.name}</h3>
            <p>{active.description}</p>
            {active.external
              ? <a className="text-link" href={active.href} target="_blank" rel="noopener noreferrer">Visit website <ArrowUpRight size={15} aria-hidden="true" /></a>
              : <Link className="text-link" href={active.href}>Explore business <ArrowUpRight size={15} aria-hidden="true" /></Link>}
          </div>
        </div>
      </div>
    </motion.div>
  </div>;
}
