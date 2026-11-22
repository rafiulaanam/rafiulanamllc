import Link from 'next/link';
import Image from 'next/image';
import { Globe2, MapPin, Package, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Business, Settings, Social } from '@/lib/content';
import { settings as initialSettings } from '@/lib/content';
import { mediaUrl } from '@/lib/media';
import { getBusinesses, getSettings, getSocials } from '@/lib/data';
import { safeHttps } from '@/lib/validation';
import { Navigation } from './navigation';
import { Button } from './ui/button';
import { Brand } from './brand';
export async function SiteHeader() {
  const [settings, businesses] = await Promise.all([getSettings(), getBusinesses()]);
  return <header className="site-header"><div className="shell header-inner">
    <Brand name={settings.company_name} image={settings.brand_logo} /><Navigation businesses={businesses.map(({slug, name}) => ({slug, name}))} />
  </div></header>;
}
export function SocialLinks({ links }: { links: Social[] }) {
  return <ul className="clean social-list">{links.flatMap(link => {
    const url = safeHttps(link.url);
    return url ? [<li key={link.id}><a href={url} target="_blank" rel="noopener noreferrer">{link.label}</a></li>] : [];
  })}</ul>;
}
export async function SiteFooter() {
  const [settings, businesses, social] = await Promise.all([getSettings(), getBusinesses(), getSocials()]);
  return <footer className="site-footer"><div className="shell">
    <div className="footer-grid">
      <div><Brand name={settings.company_name} image={settings.brand_logo} footer /><p>{settings.footer_text === initialSettings.footer_text ? 'Building Businesses. Connecting Opportunities.' : settings.footer_text}</p></div>
      <div><h2>Company</h2><Link href="/about">About</Link><Link href="/ceo">CEO</Link><Link href="/contact">Contact</Link></div>
      <div><h2>Businesses</h2>{businesses.map(b => {
        const website = b.slug !== 'ecommerce' && safeHttps(b.external_url);
        return <div key={b.slug}><Link href={'/businesses/' + b.slug}>{b.slug === 'ecommerce' ? 'E-commerce' : b.name}</Link>
          {website && <a href={website} target="_blank" rel="noopener noreferrer">Visit {b.name}</a>}</div>;
      })}<Link href="/products">Products</Link></div>
      <div><h2>Get in touch</h2>{settings.contact_email && <a href={'mailto:' + settings.contact_email}>{settings.contact_email}</a>}{settings.contact_phone && <a href={'tel:' + settings.contact_phone}>{settings.contact_phone}</a>}<Link href="/contact">Corporate inquiries</Link><SocialLinks links={social.filter(s => s.scope === 'company')} /></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {settings.company_name}</span><div><Link href="/privacy-policy">Privacy Policy</Link><Link href="/terms-and-conditions">Terms and Conditions</Link></div></div>
  </div></footer>;
}
export function Eyebrow({ children }: { children: ReactNode }) { return <p className="eyebrow"><span aria-hidden="true" />{children}</p>; }
export function PageIntro({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return <section className="page-intro"><div className="shell"><Eyebrow>{label}</Eyebrow><h1>{title}</h1>{children && <div className="lede">{children}</div>}</div></section>;
}
export function BusinessDestination({ business, label }: { business: Business; label?: string }) {
  if (business.slug === 'ecommerce') return <Button asChild><Link href="/products">{label ?? 'Explore Products'}</Link></Button>;
  const url = safeHttps(business.external_url);
  return url ? <Button asChild><a href={url} target="_blank" rel="noopener noreferrer">{label ?? `Visit ${business.name} Website`}</a></Button> : <p className="muted detail-note">Official website link pending.</p>;
}
export function BusinessCards({ businesses, editorial }: { businesses: Business[]; editorial?: Record<string, { headline: string; action: string }> }) {
  return <div className="business-grid">{businesses.map(business => {
    const logo = mediaUrl(business.logo);
    const copy = editorial?.[business.slug];
    return <article className="business-card" key={business.slug}>
      <div className="business-photo"><Image src={mediaUrl(business.image) ?? '/media/hero.webp'} alt={business.image_alt} fill sizes="(max-width: 720px) 100vw, (max-width: 1050px) 45vw, 33vw" /></div>
      <div className="business-card-body">
        <div className="business-meta"><span>{business.label}</span><span><MapPin size={13} /> {business.location}</span></div>
        {logo && <Image src={logo} width={100} height={45} className="business-logo" alt="" />}
        {copy && <p className="venture-name">{business.name}</p>}
        <h3><Link href={'/businesses/' + business.slug}>{copy?.headline ?? business.name}</Link></h3>
        <p>{business.description}</p>
        {copy && <ul className="clean venture-capabilities">{business.capabilities.map(capability => <li key={capability}>{capability}</li>)}</ul>}
        <div className="business-card-actions"><BusinessDestination business={business} label={copy?.action} /><Link className="text-link" href={'/businesses/' + business.slug}>Business profile<span className="sr-only"> for {business.name}</span></Link></div>
      </div>
    </article>;
  })}</div>;
}
export function Markets({ businesses, id }: { businesses: Business[]; id?: string }) {
  return <section id={id} className="section markets"><div className="shell market-grid">
    <div><Eyebrow>Global presence</Eyebrow><h2>Across markets.<br />Connected by one vision.</h2><p>Our businesses operate across distinct markets and through remote collaboration.</p><Globe2 size={110} strokeWidth={.5} className="market-globe" aria-hidden="true" /></div>
    <ul className="clean market-list">{businesses.map(b => <li key={b.slug}><MapPin size={18} /><div><strong>{b.location}</strong><span>{b.slug === 'ecommerce' ? 'E-commerce' : b.name}</span></div></li>)}</ul>
  </div></section>;
}
export function Portrait({ settings }: { settings: Settings }) {
  const portrait = mediaUrl(settings.ceo_portrait);
  return <div className="portrait">{portrait ? <Image src={portrait} alt={settings.ceo_name} fill sizes="(max-width: 720px) 100vw, 42vw" /> : <div className="portrait-placeholder"><UserRound size={50} strokeWidth={1} aria-hidden="true" /><span>Official portrait pending</span></div>}</div>;
}
export function ProductEmpty({ filtered = false }: { filtered?: boolean }) {
  return <div className="product-empty"><Package size={26} strokeWidth={1.5} aria-hidden="true" /><div><strong>{filtered ? 'No matching products' : 'Product listings are coming soon'}</strong><p>{filtered ? 'Try another search or category.' : 'Selected products will appear here when their Amazon USA listings are available.'}</p></div></div>;
}
export function Closing() {
  return <section className="closing"><div className="shell closing-inner"><div><h2>Have an Opportunity in Mind?</h2><p>We welcome meaningful conversations, business partnerships, and new opportunities.</p></div><Button asChild variant="light"><Link href="/contact">Get in Touch</Link></Button></div></section>;
}
