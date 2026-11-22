import type { MetadataRoute } from 'next';
import { getBusinesses, getProductSitemapEntries } from '@/lib/data';
import { siteOrigin } from '@/lib/env';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [businesses, products] = await Promise.all([getBusinesses(), getProductSitemapEntries()]);
  const origin = siteOrigin();
  return [...['/', '/about', '/businesses', '/products', '/ceo', '/contact', '/privacy-policy', '/terms-and-conditions'].map(path => ({url:origin + path})),
    ...businesses.map(business => ({url:origin + '/businesses/' + business.slug})),
    ...products.map(product => ({url:origin + '/products/' + product.slug,lastModified:product.updated_at}))];
}