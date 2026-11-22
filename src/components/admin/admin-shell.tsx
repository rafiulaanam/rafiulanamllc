'use client';

import { ArrowUpRight, Boxes, Building2, ChevronRight, CircleUserRound, LayoutDashboard, Menu, Package, PanelLeftClose, PanelLeftOpen, Settings2, X, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { companyMonogram } from '@/lib/media';

const navigation = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Boxes },
  { label: 'Businesses', href: '/admin/businesses', icon: Building2 },
  { label: 'CEO profile', href: '/admin/ceo', icon: CircleUserRound },
  { label: 'Inquiries', href: '/admin/inquiries', icon: Mail },
  { label: 'Settings', href: '/admin/settings', icon: Settings2 },
];

function AdminSidebar({ pathname, collapsed = false, onNavigate }: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return <>
    <Link className="admin-workspace-brand" href="/admin" onClick={onNavigate} aria-label="RAFIUL ANAM LLC administration overview">
      <Image src={companyMonogram} width={36} height={36} alt="" />
      {!collapsed && <span>RAFIUL ANAM LLC</span>}
    </Link>
    <nav className="admin-workspace-nav" aria-label="Administration">
      {navigation.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
        return <Link key={href} href={href} onClick={onNavigate} data-active={active}
          aria-current={pathname === href ? 'page' : undefined} aria-label={collapsed ? label : undefined}
          title={collapsed ? label : undefined}>
          <Icon size={18} aria-hidden="true" />
          {!collapsed && <span>{label}</span>}
        </Link>;
      })}
    </nav>
  </>;
}

export function AdminShell({ children, account, displayName }: {
  children: ReactNode;
  account: ReactNode;
  displayName: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const drawerTrigger = useRef<HTMLButtonElement>(null);
  const section = navigation.find(({ href }) => href !== '/admin' && (pathname === href || pathname.startsWith(href + '/')));
  const detail = section?.href === '/admin/products' && pathname !== section.href
    ? pathname.endsWith('/new') ? 'Add product' : 'Edit product'
    : null;

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)');
    const closeOnDesktop = () => {
      if (desktop.matches) drawer.current?.close();
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  const closeDrawer = () => drawer.current?.close();

  return <div className="admin-workspace" data-collapsed={collapsed}>
    <aside id="admin-sidebar" className="admin-workspace-rail">
      <AdminSidebar pathname={pathname} collapsed={collapsed} />
    </aside>
    <dialog ref={drawer} id="admin-drawer" className="admin-workspace-drawer" aria-label="Administration navigation"
      onClose={() => {
        setDrawerOpen(false);
        drawerTrigger.current?.focus();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) closeDrawer();
      }}>
      <div className="admin-workspace-drawer-panel">
        <form method="dialog" className="admin-workspace-drawer-close">
          <button className="admin-workspace-icon" type="submit" aria-label="Close navigation"><X size={19} aria-hidden="true" /></button>
        </form>
        <AdminSidebar pathname={pathname} onNavigate={closeDrawer} />
      </div>
    </dialog>
    <div className="admin-workspace-body">
      <header className="admin-workspace-header">
        <div className="admin-workspace-context">
          <button ref={drawerTrigger} className="admin-workspace-icon admin-workspace-open" type="button"
            aria-label="Open navigation" aria-haspopup="dialog" aria-controls="admin-drawer" aria-expanded={drawerOpen}
            onClick={() => {
              drawer.current?.showModal();
              setDrawerOpen(true);
            }}><Menu size={19} aria-hidden="true" /></button>
          <button className="admin-workspace-icon admin-workspace-collapse" type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-controls="admin-sidebar" aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <PanelLeftOpen size={19} aria-hidden="true" /> : <PanelLeftClose size={19} aria-hidden="true" />}
          </button>
          <nav className="admin-workspace-crumb" aria-label="Breadcrumb">
            {pathname === '/admin' ? <span aria-current="page">Overview</span> : <>
              <Link href="/admin">Overview</Link>
              {section && <><ChevronRight size={14} aria-hidden="true" />
                {detail ? <Link href={section.href}>{section.label}</Link> : <span aria-current="page">{section.label}</span>}
              </>}
              {detail && <><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{detail}</span></>}
            </>}
          </nav>
        </div>
        <div className="admin-workspace-account">
          <Link href="/" className="admin-workspace-public"><span>View public site</span><ArrowUpRight size={15} aria-hidden="true" /></Link>
          {displayName && <span className="admin-workspace-user" title={displayName}>{displayName}</span>}
          {account}
        </div>
      </header>
      <main id="main" tabIndex={-1} className="admin-workspace-main">
        <div className="admin-content">{children}</div>
        <footer className="admin-workspace-footer"><a href="https://datadropx.net" target="_blank" rel="noopener noreferrer">Designed &amp; developed by DataDropX</a></footer>
      </main>
    </div>
  </div>;
}
