'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useHydrated } from '@/lib/hydration';
import { Button } from './ui/button';

const sectionByRoute: Record<string, string> = {
  '/': 'home', '/about': 'about', '/businesses': 'businesses',
  '/products': 'featured-products', '/ceo': 'leadership', '/contact': 'contact',
};

export function Navigation({ businesses }: { businesses: { slug: string; name: string }[] }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [dropdownPath, setDropdownPath] = useState<string | null>(null);
  const [section, setSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const home = pathname === '/';
  const mobile = menuPath === pathname;
  const expanded = dropdownPath === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);
  const dropdownButton = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);
  function close() { setMenuPath(null); setDropdownPath(null); }
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !dropdown.current?.contains(event.target)) setDropdownPath(null);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  useEffect(() => {
    if (!home) return;
    let frame = 0;
    function update() {
      frame = 0;
      setScrolled(window.scrollY > 20);
      const line = window.innerHeight * .38;
      const visible = Object.values(sectionByRoute).filter(id => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        return rect && rect.top <= line && rect.bottom > line;
      });
      setSection(visible.at(-1) ?? '');
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    schedule();
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [home]);
  const active = (path: string) => path === '/' ? pathname === path : pathname === path || pathname.startsWith(path + '/');
  const links = [['/', 'Home'], ['/about', 'About'], ['/products', 'Products'], ['/ceo', 'CEO'], ['/contact', 'Contact']];
  const item = ([path, name]: string[]) => {
    const anchor = home && sectionByRoute[path];
    if (anchor) return <a key={path} href={'#' + anchor} onClick={close} className={section === anchor ? 'active' : undefined} aria-current={section === anchor ? 'location' : undefined}>{name}</a>;
    return <Link key={path} onClick={close} className={active(path) ? 'active' : ''} aria-current={pathname === path ? 'page' : undefined} href={path}>{name}</Link>;
  };
  const contact = home ? <a href="#contact" onClick={close}>Let’s Talk</a> : <Link onClick={close} href="/contact">Let’s Talk</Link>;
  return <div className="nav-controls" data-scrolled={home && scrolled ? 'true' : undefined} onKeyDown={event => {
    if (event.key !== 'Escape') return;
    if (expanded) { setDropdownPath(null); dropdownButton.current?.focus(); }
    else if (mobile) { close(); menuButton.current?.focus(); }
  }}>
    <button ref={menuButton} className="mobile-toggle" type="button" disabled={!hydrated} aria-label={mobile ? 'Close navigation' : 'Open navigation'} aria-controls="primary-navigation" aria-expanded={mobile} onClick={() => mobile ? close() : setMenuPath(pathname)}>{mobile ? <X /> : <Menu />}</button>
    <nav id="primary-navigation" className={'primary-nav' + (mobile ? ' is-open' : '')} aria-label="Main navigation">
      {links.slice(0, 2).map(item)}
      <div className="nav-dropdown" ref={dropdown} onBlur={event => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setDropdownPath(null);
      }}>
        <div className="nav-dropdown-label">{item(['/businesses', 'Our Businesses'])}
          <button ref={dropdownButton} type="button" disabled={!hydrated} aria-label="Business profiles" aria-controls="business-menu" aria-expanded={expanded} onClick={() => setDropdownPath(expanded ? null : pathname)}><ChevronDown size={15} /></button>
        </div>
        <div className="dropdown-panel" id="business-menu" hidden={!expanded}>
          {businesses.map(business => item(['/businesses/' + business.slug, business.slug === 'ecommerce' ? 'E-commerce' : business.name]))}
        </div>
      </div>
      {links.slice(2).map(item)}
      <Button className="mobile-contact" asChild>{contact}</Button>
    </nav>
    <Button className="desktop-contact" asChild variant="outline">{contact}</Button>
    <noscript><style>{'@media (max-width: 920px) {.header-inner{flex-wrap:wrap;padding-block:.7rem}.header-inner .nav-controls{width:100%}.nav-controls .mobile-toggle{display:none}.nav-controls .primary-nav{position:static;display:flex;flex-wrap:wrap;padding:.25rem 0;box-shadow:none;border:0;background:transparent}.nav-controls .desktop-contact{display:none}}'}</style></noscript>
  </div>;
}
