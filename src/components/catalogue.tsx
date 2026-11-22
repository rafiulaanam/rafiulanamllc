'use client';
import { useState, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Search } from 'lucide-react';
import type { Product } from '@/lib/content';
import { amazonLink } from '@/lib/validation';
import { mediaUrl } from '@/lib/media';
import { useHydrated } from '@/lib/hydration';
import { Button } from './ui/button';

export function Price({ product }: { product: Product }) {
  return product.price !== null ? <span className="price">{new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}</span> : null;
}
export function AmazonButton({ url }: { url: string }) {
  const destination = amazonLink(url);
  return destination ? <Button asChild><a href={destination} target="_blank" rel="noopener noreferrer">View on Amazon</a></Button> : null;
}
export function Catalogue({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const searchId = useId();
  const categoryId = useId();
  const categories = Array.from(new Map(products.flatMap(p => p.product_categories ? [[p.product_categories.slug, p.product_categories.name]] : [])).entries());
  const term = query.trim().toLowerCase();
  const matches = products.filter(p => (!category || p.product_categories?.slug === category) &&
    [p.name, p.short_description, p.product_categories?.name].some(text => text?.toLowerCase().includes(term)));
  return <>
    <div className="filters">
      <label htmlFor={searchId}>Search products <span className="search-field"><Search size={18} aria-hidden="true" /><input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by product name" /></span></label>
      <label htmlFor={categoryId}>Category<select id={categoryId} value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{categories.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label>
    </div>
    <p className="sr-only" role="status">{matches.length} products found</p>
    <ProductGrid products={matches} empty={products.length ? 'filtered' : 'catalogue'} />
  </>;
}
export function ProductGrid({products, empty = 'catalogue'}: {products:Product[];empty?:'filtered' | 'catalogue'}) {
  if (!products.length) return <div className="product-empty"><Package size={26} aria-hidden="true" /><div><strong>{empty === 'filtered' ? 'No matching products' : 'Product listings are coming soon'}</strong><p>{empty === 'filtered' ? 'Try another search or category.' : 'Selected products will appear here when their Amazon USA listings are available.'}</p></div></div>;
  return <div className="product-grid">{products.map(product => {
      const image = mediaUrl(product.image);
      const url = '/products/' + product.slug;
      return <article className="product-card" key={product.id}>
        <Link className="product-photo" href={url} aria-label={product.name}>{image ? <Image src={image} alt={product.image_alt} fill sizes="(max-width: 720px) 100vw, 33vw" /> : <Package size={36} aria-hidden="true" />}</Link>
        <div className="product-card-body"><p className="kicker">{product.product_categories?.name ?? 'Amazon USA'}</p><h3><Link href={url}>{product.name}</Link></h3><p>{product.short_description}</p><Price product={product} /><AmazonButton url={product.amazon_url} /></div>
      </article>;
  })}</div>;
}
export function Gallery({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const images = [
    {id: 'primary', path: product.image, alt: product.image_alt},
    ...(product.product_images ?? []).slice().sort((a, b) => a.display_order - b.display_order),
  ].flatMap(image => {
    const src = mediaUrl(image.path);
    return src ? [{...image, src}] : [];
  });
  const [active, setActive] = useState(0);
  const image = images[active] ?? images[0];
  return <div><div className="gallery-main">{image ? <Image src={image.src} alt={image.alt} fill loading="eager" sizes="(max-width: 720px) 100vw, 50vw" /> : <Package size={46} aria-hidden="true" />}</div>
    {images.length > 1 && <div className="gallery-thumbs">{images.map((image, index) => <button key={image.id} type="button" disabled={!hydrated} aria-label={'View image ' + (index + 1) + ': ' + image.alt} aria-pressed={active === index} onClick={() => setActive(index)}><Image src={image.src} alt="" fill sizes="70px" /></button>)}</div>}
  </div>;
}
