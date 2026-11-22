import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowDown, ArrowRight, Compass, Globe2, Handshake, Lightbulb, ListChecks, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';
import { getBusinesses, getFeaturedProducts, getSettings, getSocials } from '@/lib/data';
import { businesses as initialBusinesses, settings as initialSettings } from '@/lib/content';
import { geographicMarkets } from '@/lib/business-markets';
import { pageMetadata, JsonLd } from '@/lib/seo';
import { siteOrigin } from '@/lib/env';
import { companyLogo, mediaUrl } from '@/lib/media';
import { safeHttps } from '@/lib/validation';
import { BusinessCards, Eyebrow, Portrait, ProductEmpty, SocialLinks } from '@/components/site';
import { Catalogue } from '@/components/catalogue';
import { EarthBackdrop } from '@/components/earth-backdrop';
import { EcosystemExplorer } from '@/components/ecosystem-explorer';
import { MarketCount } from '@/components/market-count';
import { HeroCopy } from '@/components/hero-copy';
import { Button } from '@/components/ui/button';
import './landing.css';

const introductions = [
  'RAFIUL ANAM LLC is an entrepreneurial business organization focused on developing and supporting opportunities across e-commerce, logistics, and technology.',
  'From online marketplaces in the United States and Bangladesh to fleet operations in Spain and international digital technology services, our business ecosystem reflects a commitment to exploring new markets, building meaningful ventures, and embracing innovation.',
  'We bring together different capabilities under one corporate vision while allowing each business to maintain its own identity, expertise, and direction.',
];

const ventureCopy: Record<string, { headline: string; description?: string; capabilities?: string[]; action: string }> = {
  ecommerce: {
    headline: 'Commerce Without Boundaries.',
    description: 'We participate in the United States e-commerce marketplace through Amazon, bringing selected products to customers through an established global marketplace.',
    capabilities: ['Amazon marketplace selling', 'Product sourcing and selection', 'Online product distribution'],
    action: 'Explore Our Products',
  },
  'anamigo-fleet': {
    headline: 'Moving Business Forward.',
    description: 'ANAMIGO Fleet represents our logistics and delivery fleet venture in Spain, focused on organized operations, rider coordination, and delivery partnerships.',
    capabilities: ['Fleet operations', 'Delivery workforce coordination', 'Logistics partnerships'],
    action: 'Visit ANAMIGO Fleet',
  },
  anamsoft: {
    headline: 'Technology That Creates Possibilities.',
    description: 'ANAMSOFT represents our technology and software development business, delivering modern digital solutions, web applications, and digital products.',
    capabilities: ['Full-stack web development', 'Custom websites and applications', 'Digital products and templates'],
    action: 'Visit ANAMSOFT',
  },
  anamcart: {
    headline: 'Multi-category shopping in Bangladesh.',
    action: 'Visit ANAMCART',
  },
};

const coreValues = [
  { icon: Compass, title: 'Vision Beyond Boundaries', copy: 'We believe in thinking beyond traditional limitations, exploring new markets, and identifying opportunities across industries.' },
  { icon: Lightbulb, title: 'Innovation & Technology', copy: 'We embrace modern technology, creativity, and forward-thinking approaches to build better solutions and business opportunities.' },
  { icon: ShieldCheck, title: 'Integrity & Responsibility', copy: 'We value honesty, transparency, accountability, and responsible business practices in every professional relationship.' },
  { icon: ListChecks, title: 'Excellence in Execution', copy: 'We believe strong ideas require thoughtful planning, consistent effort, and attention to detail to become meaningful results.' },
  { icon: TrendingUp, title: 'Continuous Growth', copy: 'We believe learning, adapting, and improving are essential to building sustainable businesses in a changing world.' },
  { icon: Handshake, title: 'Collaboration & Opportunity', copy: 'We value meaningful partnerships, professional relationships, and collaboration that create mutual opportunities.' },
];

async function FeaturedProducts() {
  const products = await getFeaturedProducts().catch(() => null);
  if (!products) {
    return <p className="form-notice" role="status">Featured products are temporarily unavailable. <Link href="/products">Visit the product catalogue</Link> or check back later.</p>;
  }
  return products.length ? <Catalogue products={products} /> : <ProductEmpty />;
}

export const generateMetadata = () => pageMetadata('/');
export default async function Home() {
  const [settings, businesses, socials] = await Promise.all([getSettings(), getBusinesses(), getSocials()]);
  const origin = siteOrigin();
  const logo = mediaUrl(settings.brand_logo) ?? companyLogo;
  const intro = settings.introduction === initialSettings.introduction ? introductions : [settings.introduction];
  const ventures = businesses.map(business => {
    const initial = initialBusinesses.find(item => item.slug === business.slug);
    const copy = ventureCopy[business.slug];
    if (!initial || !copy) return business;
    return {
      ...business,
      description: business.description === initial.description ? copy.description ?? business.description : business.description,
      capabilities: business.capabilities.length === initial.capabilities.length &&
        business.capabilities.every((capability, index) => capability === initial.capabilities[index]) ? copy.capabilities ?? business.capabilities : business.capabilities,
    };
  });
  const explorer = ventures.map(business => {
    const external = business.slug !== 'ecommerce' ? safeHttps(business.external_url) : null;
    return {
      ...business,
      label: business.slug === 'ecommerce' ? 'Amazon E-commerce' : business.name,
      href: external ?? (business.slug === 'ecommerce' ? '/products' : '/businesses/' + business.slug),
      external: Boolean(external),
    };
  });
  const geographicVentures = ventures.filter(business => geographicMarkets[business.slug]);
  const markets = new Set(geographicVentures.map(business => business.location));
  const ventureCount = ['','','Two','Three','Four'][ventures.length];
  const brands = explorer.map(business => business.label);
  const ceoBio = settings.ceo_bio === initialSettings.ceo_bio
    ? 'Rafiul Anam is the founder and CEO of RAFIUL ANAM LLC, leading an entrepreneurial vision that spans e-commerce, logistics, and technology.'
    : settings.ceo_bio;
  const ceoVision = settings.ceo_vision === initialSettings.ceo_vision
    ? 'His approach is centered on continuous learning, innovation, operational development, and creating opportunities through entrepreneurship.'
    : settings.ceo_vision;

  return <div className="immersive-home">
    <JsonLd value={{'@context':'https://schema.org','@type':'Organization','@id':origin + '/#organization',name:settings.company_name,url:origin,
      description:settings.introduction, logo:new URL(logo, origin).href,
      ...(settings.contact_email && {email:settings.contact_email}), ...(settings.contact_phone && {telephone:settings.contact_phone}),
      sameAs:socials.filter(s=>s.scope==='company').flatMap(s=>safeHttps(s.url) ?? [])}} />
    <section id="home" className="immersive-hero" aria-labelledby="landing-title">
      <EarthBackdrop marketSlugs={geographicVentures.map(business => business.slug)} />
      <div className="shell hero-shell">
        <HeroCopy>
          <Eyebrow>An International Business Ecosystem</Eyebrow>
          <h1 id="landing-title">Building Businesses. <span>Connecting Opportunities.</span></h1>
          <p>From global e-commerce to logistics and digital technology, we bring entrepreneurial ideas together to create meaningful business opportunities.</p>
          <div className="actions">
            <Button asChild><a href="#businesses">Explore Our Businesses <ArrowRight size={17} aria-hidden="true" /></a></Button>
            <Button asChild variant="outline"><a href="#about">Discover Our Story</a></Button>
          </div>
        </HeroCopy>
        <a className="hero-scroll" href="#about" aria-label="Scroll to company introduction"><ArrowDown size={17} aria-hidden="true" /></a>
      </div>
    </section>

    <section className="immersive-section company-section" id="about" aria-labelledby="company-introduction">
      <div className="shell home-editorial landing-enter">
        <div><Eyebrow>Who We Are</Eyebrow><h2 id="company-introduction">One Vision. Multiple Business Opportunities.</h2></div>
        <div>{intro.map(copy => <p key={copy}>{copy}</p>)}<Link className="text-link" href="/about">Read our story <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </div>
    </section>

    <section className="immersive-section ventures-section" id="businesses" aria-labelledby="ecosystem-title">
      <div className="shell">
        <div className="section-heading landing-enter"><div><Eyebrow>Our Businesses</Eyebrow><h2 id="ecosystem-title">{ventureCount && ventureCount + ' Businesses. '}One Growing Ecosystem.</h2></div><Link className="text-link" href="/businesses">View all businesses <ArrowRight size={16} aria-hidden="true" /></Link></div>
        <BusinessCards businesses={ventures} editorial={ventureCopy} />
      </div>
    </section>

    <section className="immersive-section products-section" id="featured-products" aria-labelledby="featured-title">
      <div className="shell">
        <div className="section-heading landing-enter"><div><Eyebrow>Selected Products</Eyebrow><h2 id="featured-title">Discover What We Bring to Market.</h2><p>Explore selected products available through our Amazon United States marketplace.</p></div><Link className="text-link" href="/products">Browse the catalogue <ArrowRight size={16} aria-hidden="true" /></Link></div>
        <Suspense fallback={<p className="form-notice" role="status">Loading featured products…</p>}><FeaturedProducts /></Suspense>
      </div>
    </section>

    {explorer.length > 0 && <section className="immersive-section showcase-section" id="business-showcase" aria-labelledby="showcase-title"><div className="shell">
      <div className="section-heading landing-enter"><div><Eyebrow>Interactive Business Showcase</Eyebrow><h2 id="showcase-title">Explore the ecosystem.</h2><p>Select a venture to see its market, focus, and where to learn more.</p></div></div>
      <EcosystemExplorer ventures={explorer} company={settings.company_name} />
    </div></section>}

    <section className="immersive-section presence-section" id="global-presence" aria-labelledby="presence-title">
      <div className="shell home-editorial landing-enter">
        <div><Eyebrow>Global Presence</Eyebrow><h2 id="presence-title">Local Operations. Global Perspectives.</h2>
          <dl className="market-metrics">
            <div><dt>Business activities</dt><dd><MarketCount value={ventures.length} /></dd></div>
            <div><dt>Named markets</dt><dd><MarketCount value={markets.size} /></dd></div>
          </dl>
        </div>
        <ul className="clean presence-list">{explorer.map(venture => <li key={venture.slug}>
          <a href={'#market-' + venture.slug}>{venture.slug === 'anamsoft' ? <Globe2 size={21} aria-hidden="true" /> : <MapPin size={21} aria-hidden="true" />}
            <span><strong>{venture.location}</strong><span>{venture.label}</span></span><ArrowRight size={18} aria-hidden="true" />
          </a>
        </li>)}</ul>
      </div>
      {brands.length > 0 && <div className="venture-marquee" aria-label="Business brands">
        <ul className="sr-only">{brands.map(brand => <li key={brand}>{brand}</li>)}</ul>
        <div className="marquee-track" aria-hidden="true">{[0,1].map(group => <div className="marquee-group" key={group}>
          {Array.from({length:8}, (_, repeat) => brands.map(brand => <span key={repeat + brand}>{brand}</span>))}
        </div>)}</div>
      </div>}
    </section>

    <section className="immersive-section philosophy-section" id="philosophy" aria-labelledby="philosophy-title">
      <div className="shell">
        <div className="home-editorial landing-enter">
          <div><Eyebrow>What Drives Us</Eyebrow><h2 id="philosophy-title">Built on Vision. Driven by Innovation.</h2></div>
          <div>
            <p>We believe entrepreneurship is more than starting businesses. It is about recognizing opportunities, solving real problems, and continuously creating value.</p>
            <p>Our philosophy is built around exploring new possibilities, developing meaningful business ventures, and embracing technology as a driver of progress.</p>
            <p>We bring together different business activities under one entrepreneurial vision while allowing each venture to develop its own identity, capabilities, and direction.</p>
          </div>
        </div>
        <div className="landing-values">
          <h3>Our Core Values</h3>
          <ul className="clean landing-values-grid">{coreValues.map(({icon: Icon, title, copy}) => <li key={title} className="landing-enter">
            <Icon size={23} strokeWidth={1.6} aria-hidden="true" /><h4>{title}</h4><p>{copy}</p>
          </li>)}</ul>
        </div>
      </div>
    </section>

    <section className="immersive-section leadership-section" id="leadership" aria-labelledby="leadership-title">
      <div className="shell leadership-layout landing-enter">
        <Portrait settings={settings} />
        <div><Eyebrow>Leadership</Eyebrow><h2 id="leadership-title">Meet {settings.ceo_name}.</h2>
          <p className="ceo-role">{settings.ceo_designation === initialSettings.ceo_designation ? 'Founder & Chief Executive Officer' : settings.ceo_designation}</p>
          <p>{ceoBio}</p>
          {settings.ceo_bio === initialSettings.ceo_bio && <p>With an interest in business development and full-stack web development, he brings together commercial thinking and technical capabilities to build and develop different business ventures.</p>}
          <p>{ceoVision}</p>
          <Button asChild variant="outline"><Link href="/ceo">Explore Profile <ArrowRight size={16} aria-hidden="true" /></Link></Button>
          <SocialLinks links={socials.filter(social => social.scope === 'ceo')} />
        </div>
      </div>
    </section>

    <section className="immersive-section final-cta" id="contact" aria-labelledby="contact-title"><div className="shell landing-enter">
      <Eyebrow>Contact</Eyebrow>
      <h2 id="contact-title">Every Great Opportunity Starts With a Conversation.</h2>
      <p>Whether you are exploring a business partnership, an e-commerce opportunity, or a new collaboration, we welcome meaningful conversations.</p>
      <Button asChild><Link href="/contact">Get in Touch <ArrowRight size={17} aria-hidden="true" /></Link></Button>
      <small className="earth-credit">Earth imagery by <a href="https://www.solarsystemscope.com/textures/">Solar System Scope</a> under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></small>
    </div></section>
  </div>;
}
