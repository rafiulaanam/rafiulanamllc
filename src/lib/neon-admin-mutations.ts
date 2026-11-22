import 'server-only';
import type { Prisma, PrismaClient } from '@/generated/prisma/client';
import { settings } from './content';
import {
  AdminRecordError, parse, idSchema, productSchema, businessSchema, settingsSchema, ceoSchema,
  categorySchema, socialSchema, inquirySchema, gallerySchema,
} from './admin-validation';
import { AdminInputError } from './uploads';
import { destroyCloudImage, uploadCloudImage } from './cloudinary';
import { inquiryKind } from './neon-data';

type MutationResult = { id: string; destination?: string; retired?: (string | null)[] };
type Uploaded = NonNullable<Awaited<ReturnType<typeof uploadCloudImage>>>;

function requiresRecord<T>(row: T | null): T {
  if (!row) throw new AdminRecordError('This item is no longer available.',404);
  return row;
}

export async function mutateNeonAdminContent(db: PrismaClient, actorId: string, form: FormData) {
  const values = Object.fromEntries(form);
  const operation = form.get('operation');
  const idValue = form.get('id');
  const id = idValue ? parse(idSchema,idValue) : null;
  const uploads: Uploaded[] = [];

  async function upload(field: string, folder: Parameters<typeof uploadCloudImage>[1]) {
    const asset = await uploadCloudImage(form.get(field),folder);
    if (asset) uploads.push(asset);
    return asset?.url;
  }

  function save(apply: (tx: Prisma.TransactionClient) => Promise<MutationResult>) {
    return db.$transaction(async tx => {
      const actor = await tx.user.findFirst({where:{id:actorId,disabledAt:null,roles:{some:{role:'admin'}}},select:{id:true}});
      if (!actor) throw new AdminRecordError('Administrator access is required.',403);
      if (uploads.length) await tx.mediaAsset.createMany({data:uploads});
      const {id,destination,retired} = await apply(tx);
      const action = String(operation);
      await tx.activityLog.create({data:{
        actorId,action,resource:action.replace(/^delete-/, '').replace('mark-read','inquiry'),resourceId:id,
      }});
      const urls = [...new Set(retired?.filter((url): url is string => !!url) ?? [])];
      if (urls.length) await tx.mediaAsset.updateMany({
        where:{
          url:{in:urls},cloudinaryId:{not:null},orphanedAt:null,
          businessImages:{none:{}},businessLogos:{none:{}},products:{none:{}},
          productImages:{none:{}},siteLogos:{none:{}},sitePortraits:{none:{}},
        },
        data:{orphanedAt:new Date()},
      });
      return {id,destination};
    },{isolationLevel:'Serializable'});
  }

  try {
    switch (operation) {
      case 'product': {
        const fields = parse(productSchema,values);
        const published = form.has('published');
        const featured = form.has('featured');
        if (published && (!fields.category_id || !fields.image_alt)) {
          throw new AdminInputError('A published product needs a category and image description.');
        }
        const image = await upload('image','products');
        return await save(async tx => {
          const previous = id ? requiresRecord(await tx.product.findUnique({where:{id},select:{image:true}})) : null;
          if (published && !image && !previous?.image) throw new AdminInputError('Upload a main image before publishing.');
          const data = {...fields,published,featured,...(image && {image})};
          const row = id ? await tx.product.update({where:{id},data}) : await tx.product.create({data});
          return {id:row.id,destination:id ? undefined : '/admin/products/' + row.id,retired:image ? [previous?.image ?? null] : []};
        });
      }
      case 'delete-product': {
        const productId = parse(idSchema,id);
        return await save(async tx => {
          const gallery = await tx.productImage.findMany({where:{product_id:productId},select:{path:true}});
          const row = await tx.product.delete({where:{id:productId}});
          return {id:row.id,destination:'/admin/products',retired:[row.image,...gallery.map(item => item.path)]};
        });
      }
      case 'category': {
        const data = parse(categorySchema,values);
        return await save(tx => id ? tx.productCategory.update({where:{id},data}) : tx.productCategory.create({data}));
      }
      case 'delete-category': {
        const record = parse(idSchema,id);
        return await save(tx => tx.productCategory.delete({where:{id:record}}));
      }
      case 'gallery': {
        const {product_id,alt,display_order} = parse(gallerySchema,values);
        if (id) return await save(tx => tx.productImage.update({where:{id,product_id},data:{alt,display_order}}));
        const path = await upload('image','gallery');
        if (!path) throw new AdminInputError('Choose a gallery image.');
        return await save(tx => tx.productImage.create({data:{product_id,path,alt,display_order}}));
      }
      case 'delete-gallery': {
        const record = parse(idSchema,id);
        return await save(async tx => {
          const row = await tx.productImage.delete({where:{id:record}});
          return {id:row.id,retired:[row.path]};
        });
      }
      case 'business': {
        const record = parse(idSchema,id);
        const fields = parse(businessSchema,values);
        const image = await upload('image','businesses');
        const logo = await upload('logo','logos');
        return await save(async tx => {
          const where = {id:record};
          const previous = requiresRecord(await tx.business.findUnique({where,select:{image:true,logo:true}}));
          const row = await tx.business.update({where,data:{...fields,published:form.has('published'),...(image && {image}),...(logo && {logo})}});
          return {id:row.id,retired:[image ? previous.image : null,logo ? previous.logo : null]};
        });
      }
      case 'settings':
      case 'ceo': {
        const isCeo = operation === 'ceo';
        const fields = isCeo ? parse(ceoSchema,values) : parse(settingsSchema,values);
        const column = isCeo ? 'ceo_portrait' : 'brand_logo';
        const path = await upload(column,isCeo ? 'leadership' : 'logos');
        return await save(async tx => {
          const where = {singleton:true};
          const previous = path ? await tx.siteSetting.findUnique({where,select:{brand_logo:true,ceo_portrait:true}}) : null;
          const data = {...fields,...(path && {[column]:path})};
          const row = await tx.siteSetting.upsert({
            where, update:data, create:{...settings,ceo_portrait:null,...data},
          });
          return {id:row.id,retired:previous ? [previous[column]] : []};
        });
      }
      case 'social': {
        const data = parse(socialSchema,values);
        return await save(tx => id ? tx.socialLink.update({where:{id},data}) : tx.socialLink.create({data}));
      }
      case 'delete-social': {
        const record = parse(idSchema,id);
        return await save(tx => tx.socialLink.delete({where:{id:record}}));
      }
      case 'inquiry': {
        const record = parse(idSchema,id);
        const {kind,status} = parse(inquirySchema,values);
        return await save(tx => tx.inquiry.update({where:{id:record},data:{kind:inquiryKind(kind),status}}));
      }
      case 'mark-read': {
        const record = parse(idSchema,id);
        return await save(async tx => {
          await tx.inquiry.updateMany({where:{id:record,read_at:null},data:{read_at:new Date()}});
          return requiresRecord(await tx.inquiry.findUnique({where:{id:record},select:{id:true}}));
        });
      }
      case 'delete-inquiry': {
        const record = parse(idSchema,id);
        return await save(tx => tx.inquiry.delete({where:{id:record}}));
      }
      default: throw new AdminInputError('Unknown operation.');
    }
  } catch (error) {
    await Promise.allSettled(uploads.map(async asset => {
      // If the commit outcome is uncertain, preserve the image until the database can confirm it is unreferenced.
      if (!await db.mediaAsset.findUnique({where:{url:asset.url},select:{id:true}})) await destroyCloudImage(asset.cloudinaryId);
    }));
    const code = error instanceof Error && 'code' in error ? error.code : undefined;
    if (code === 'P2002') throw new AdminRecordError('A record already uses that name or slug.',409);
    if (code === 'P2003') throw new AdminRecordError('The record is still linked to another item, or a selected item no longer exists.',409);
    if (code === 'P2025') throw new AdminRecordError('This item is no longer available.',404);
    if (code === 'P2034') throw new AdminRecordError('Another change was saved at the same time. Try again.',409);
    throw error;
  }
}
