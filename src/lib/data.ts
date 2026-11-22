import 'server-only';
import { cache } from 'react';
import { databaseConfigured } from './backend';
import { prisma } from './prisma';
import { neonBrowseProducts, neonFeaturedProducts, neonGetProduct } from './neon-data';
import { settings, businesses, type Settings, type Business, type Category, type Product, type Social } from './content';

export const getSettings = cache(async (): Promise<Settings> => {
  if (!databaseConfigured()) return settings;
  const current = await prisma().siteSetting.findUnique({where:{singleton:true}});
  return current ? {...current,ceo_portrait:current.ceo_portrait ?? settings.ceo_portrait} : settings;
});

export const getBusinesses = cache(async (): Promise<Business[]> => {
  if (!databaseConfigured()) return businesses;
  return prisma().business.findMany({where:{published:true},orderBy:[{display_order:'asc'},{name:'asc'},{id:'asc'}]});
});

export const getSocials = cache(async (): Promise<Social[]> => {
  if (!databaseConfigured()) return [];
  return prisma().socialLink.findMany({orderBy:[{display_order:'asc'},{label:'asc'},{id:'asc'}]});
});

export const getFeaturedProducts = cache(async (): Promise<Product[]> =>
  databaseConfigured() ? neonFeaturedProducts() : []);

export const cataloguePageSize = 18;
export async function browseProducts(search: string, category: string, page: number) {
  if (!databaseConfigured()) return {products:[] as Product[],categories:[] as Category[],count:0};
  return neonBrowseProducts(search,category,(page - 1) * cataloguePageSize,cataloguePageSize);
}

export async function getProductSitemapEntries() {
  if (!databaseConfigured()) return [];
  const entries = await prisma().product.findMany({where:{published:true},select:{slug:true,updatedAt:true},orderBy:{id:'asc'},take:49000});
  return entries.map(({slug,updatedAt}) => ({slug,updated_at:updatedAt.toISOString()}));
}

export const getProduct = cache(async (slug: string): Promise<Product | null> =>
  databaseConfigured() ? neonGetProduct(slug) : null);
