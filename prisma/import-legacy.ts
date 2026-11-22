import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { connectForMigration } from './connection.ts';

class ImportError extends Error {}

const date = z.iso.datetime({offset:true}).transform(value => new Date(value));
const row = z.object({id:z.uuid(),created_at:date,updated_at:date});
const text = z.string();
const optional = text.nullable();
const position = z.number().int();
const kinds = {
  'General inquiry':'general','Business partnership':'partnership','E-commerce':'ecommerce',
  'ANAMIGO Fleet':'anamigo_fleet',ANAMSOFT:'anamsoft',ANAMCART:'anamcart',
} as const;

const snapshotSchema = z.object({
  profiles:row.extend({display_name:optional}).array(),
  user_roles:row.extend({user_id:z.uuid(),role:z.literal('admin')}).array(),
  businesses:row.extend({
    slug:text,name:text,label:text,location:text,description:text,overview:text,capabilities:text.array(),
    image:text,image_alt:text,logo:optional,external_url:optional,display_order:position,published:z.boolean(),
  }).array(),
  product_categories:row.extend({name:text,slug:text}).array(),
  products:row.extend({
    name:text,slug:text,short_description:text,description:text,image:optional,image_alt:text,category_id:z.uuid().nullable(),
    amazon_url:text,price:z.union([z.number(),z.string().regex(/^\d+(?:\.\d{1,2})?$/)]).nullable(),
    currency:text,featured:z.boolean(),published:z.boolean(),display_order:position,
  }).array(),
  product_images:row.extend({product_id:z.uuid(),path:text,alt:text,display_order:position}).array(),
  inquiries:row.extend({
    name:text,email:text,company:optional,kind:z.enum(kindsKeys()),message:text,status:z.enum(['new','in_progress','closed']),read_at:date.nullable(),
  }).array(),
  site_settings:row.extend({
    singleton:z.literal(true),company_name:text,introduction:text,positioning:text,brand_logo:optional,
    contact_email:optional,contact_phone:optional,footer_text:text,seo_title:text,seo_description:text,
    ceo_name:text,ceo_designation:text,ceo_bio:text,ceo_vision:text,ceo_portrait:optional,
  }).array().length(1),
  social_links:row.extend({scope:z.enum(['ceo','company']),label:text,url:text,display_order:position}).array(),
});

function kindsKeys() {
  return Object.keys(kinds) as (keyof typeof kinds)[];
}

const mediaSchema = z.object({
  source:text,url:z.url(),cloudinaryId:text.min(1),width:z.number().int().positive(),
  height:z.number().int().positive(),bytes:z.number().int().positive(),format:text.min(1),
}).array();

function dates<T extends {created_at:Date;updated_at:Date}>({created_at,updated_at,...fields}: T) {
  return {...fields,createdAt:created_at,updatedAt:updated_at};
}

async function run() {
  const [snapshotPath,manifestPath,mode,...extra] = process.argv.slice(2);
  if (!snapshotPath || !manifestPath || extra.length || (mode !== undefined && mode !== '--apply')) {
    throw new ImportError('Usage: npm run db:import -- <snapshot.json> <media-map.json> [--apply]');
  }
  const data = snapshotSchema.parse(JSON.parse(await readFile(snapshotPath,'utf8')));
  const manifest = mediaSchema.parse(JSON.parse(await readFile(manifestPath,'utf8')));
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const prefix = 'https://res.cloudinary.com/' + cloud + '/image/upload/';
  const mapping = new Map(manifest.map(item => [item.source,item]));
  if (mapping.size !== manifest.length || new Set(manifest.map(item => item.cloudinaryId)).size !== manifest.length ||
      new Set(manifest.map(item => item.url)).size !== manifest.length ||
      manifest.some(item => !cloud || !/^[\w-]+$/.test(cloud) || !new URL(item.url).href.startsWith(prefix))) {
    throw new ImportError('The media map must use unique assets from the configured Cloudinary cloud.');
  }
  const assets = new Map<string,{url:string;cloudinaryId?:string;width?:number;height?:number;bytes?:number;format?:string}>();
  function resolveMedia(source: string): string;
  function resolveMedia(source: null): null;
  function resolveMedia(source: string | null): string | null;
  function resolveMedia(source: string | null) {
    if (source === null) return null;
    const item = mapping.get(source);
    if (item) {
      const {url,cloudinaryId,width,height,bytes,format} = item;
      assets.set(url,{url,cloudinaryId,width,height,bytes,format});
      return url;
    }
    if (!/^\/media\/[a-z0-9-]+\.webp$/.test(source)) throw new ImportError('A hosted image is missing from the media map.');
    assets.set(source,{url:source});
    return source;
  }
  const businesses = data.businesses.map(row => ({...dates(row),image:resolveMedia(row.image),logo:resolveMedia(row.logo)}));
  const products = data.products.map(row => ({...dates(row),image:resolveMedia(row.image)}));
  const galleries = data.product_images.map(row => ({...dates(row),path:resolveMedia(row.path)}));
  const settings = data.site_settings.map(row => ({...dates(row),brand_logo:resolveMedia(row.brand_logo),ceo_portrait:resolveMedia(row.ceo_portrait)}));
  const counts = Object.fromEntries(Object.entries(data).map(([table,rows]) => [table,rows.length]));
  console.log(JSON.stringify({mode:mode ?? 'dry run',records:counts,referencedMedia:assets.size}));
  if (mode !== '--apply') return;
  const db = connectForMigration();
  try {
    await db.$transaction(async tx => {
      const existing = await Promise.all([
        tx.user.count(),tx.userRole.count(),tx.business.count(),tx.productCategory.count(),tx.product.count(),
        tx.productImage.count(),tx.inquiry.count(),tx.siteSetting.count(),tx.socialLink.count(),
        tx.activityLog.count(),tx.mediaAsset.count(),tx.inquiryRateLimit.count(),
      ]);
      if (existing.some(count => count > 0)) throw new ImportError('Import requires an empty destination.');
      await tx.mediaAsset.createMany({data:[...assets.values()]});
      await tx.user.createMany({data:data.profiles.map(({display_name,...row}) => ({...dates(row),displayName:display_name}))});
      await tx.userRole.createMany({data:data.user_roles.map(dates)});
      await tx.business.createMany({data:businesses});
      await tx.productCategory.createMany({data:data.product_categories.map(dates)});
      await tx.product.createMany({data:products});
      await tx.productImage.createMany({data:galleries});
      await tx.inquiry.createMany({data:data.inquiries.map(({kind,...row}) => ({...dates(row),kind:kinds[kind]}))});
      await tx.siteSetting.createMany({data:settings});
      await tx.socialLink.createMany({data:data.social_links.map(dates)});
    },{isolationLevel:'Serializable',timeout:120_000});
    console.log('Import committed. Review counts before cutover.');
  } finally { await db.$disconnect(); }
}

run().catch(error => {
  if (error instanceof z.ZodError) console.error('Snapshot or media manifest validation failed.');
  else if (error instanceof ImportError) console.error(error.message);
  else console.error('Import failed. The destination transaction was not confirmed.');
  process.exitCode = 1;
});
