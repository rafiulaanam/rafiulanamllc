import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { BusinessDestination, Closing, Eyebrow, PageIntro, ProductEmpty } from '@/components/site';
import { Catalogue } from '@/components/catalogue';
import { getBusinesses, getFeaturedProducts } from '@/lib/data';
import { mediaUrl } from '@/lib/media';
import { pageMetadata } from '@/lib/seo';
type Props = { params: Promise<{slug: string}> };
async function getBusiness(params: Props['params']) {
  const [{slug}, businesses] = await Promise.all([params, getBusinesses()]);
  const business = businesses.find(item => item.slug === slug);
  if (!business) notFound();
  return business;
}
export async function generateMetadata({params}: Props) {
  const b = await getBusiness(params);
  return pageMetadata('/businesses/' + b.slug, b.name, b.description, mediaUrl(b.image) ?? undefined);
}
export default async function BusinessPage({params}: Props) {
  const business = await getBusiness(params);
  const ecommerce = business.slug === 'ecommerce';
  const products = ecommerce ? await getFeaturedProducts() : [];
  const logo = mediaUrl(business.logo);
  return <><PageIntro label={business.label + ' · ' + business.location} title={business.name}><p>{business.description}</p><BusinessDestination business={business} /></PageIntro>
    <section className="section"><div className="shell split detail-split">
      <div className="detail-image"><Image src={mediaUrl(business.image) ?? '/media/hero.webp'} alt={business.image_alt} fill sizes="(max-width:720px) 100vw, 50vw" /></div>
      <div>{logo && <Image src={logo} width={130} height={55} alt="" className="business-logo" />}<Eyebrow>Business overview</Eyebrow><h2>What we do.</h2><p>{business.overview}</p><p className="location"><MapPin size={17} /> {business.location}</p><ul className="clean capability-list">{business.capabilities.map(capability => <li key={capability}>{capability}</li>)}</ul></div>
    </div></section>
    {ecommerce && <section className="section businesses-section"><div className="shell"><div className="section-heading"><div><Eyebrow>Amazon USA</Eyebrow><h2>Featured products.</h2></div><Link className="text-link" href="/products">Browse all products</Link></div>{products.length ? <Catalogue products={products} /> : <ProductEmpty />}</div></section>}
    <Closing /></>;
}