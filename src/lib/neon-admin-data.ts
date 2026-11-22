import 'server-only';
import type { PrismaClient, SocialScope } from '@/generated/prisma/client';
import { datedRow, inquiryRow, productOrder, productRow } from './neon-data';

export async function neonAdminOverview(db: PrismaClient) {
  const [published,inquiryCount,products,inquiries,businesses] = await Promise.all([
    db.product.count({where:{published:true}}),db.inquiry.count(),
    db.product.findMany({orderBy:{updatedAt:'desc'},take:5}),
    db.inquiry.findMany({orderBy:{updatedAt:'desc'},take:5}),
    db.business.findMany({orderBy:{updatedAt:'desc'},take:5}),
  ]);
  return {
    published,inquiryCount,
    activity:[
      ...products.map(item => ({...datedRow(item),label:item.name,href:'/admin/products/' + item.id,group:'Product'})),
      ...inquiries.map(inquiryRow).map(item => ({...item,label:item.kind,href:'/admin/inquiries#inquiry-' + item.id,group:'Inquiry'})),
      ...businesses.map(item => ({...datedRow(item),label:item.name,href:'/admin/businesses#business-' + item.id,group:'Business'})),
    ],
  };
}

export async function neonAdminProducts(db: PrismaClient, skip: number, take: number) {
  const [rows,count] = await db.$transaction([db.product.findMany({skip,take,orderBy:productOrder}),db.product.count()]);
  return {rows:rows.map(productRow),count};
}

export async function neonAdminInquiries(db: PrismaClient, skip: number, take: number) {
  const [rows,count] = await db.$transaction([
    db.inquiry.findMany({skip,take,orderBy:[{updatedAt:'desc'},{id:'asc'}]}),db.inquiry.count(),
  ]);
  return {rows:rows.map(inquiryRow),count};
}

export async function neonAdminSettings(db: PrismaClient, scope: SocialScope) {
  return Promise.all([
    db.siteSetting.findUniqueOrThrow({where:{singleton:true}}),
    db.socialLink.findMany({where:{scope},orderBy:[{display_order:'asc'},{label:'asc'}]}),
  ]);
}

export async function neonAdminProduct(db: PrismaClient, id: string) {
  const row = await db.product.findUnique({where:{id},include:{product_categories:true,product_images:true}});
  return row ? productRow(row) : null;
}

export function neonCategories(db: PrismaClient) {
  return db.productCategory.findMany({select:{id:true,name:true,slug:true},orderBy:{name:'asc'}});
}

export function neonAdminResources(db: PrismaClient) {
  const orderBy = {id:'asc'} as const;
  return {
    products: {
      one: async (id: string) => { const row = await db.product.findUnique({where:{id}}); return row && productRow(row); },
      list: async (skip: number,take: number) => {
        const [rows,total] = await db.$transaction([db.product.findMany({skip,take,orderBy}),db.product.count()]);
        return {data:rows.map(productRow),total};
      },
    },
    categories: {
      one: async (id: string) => { const row = await db.productCategory.findUnique({where:{id}}); return row && datedRow(row); },
      list: async (skip: number,take: number) => {
        const [rows,total] = await db.$transaction([db.productCategory.findMany({skip,take,orderBy}),db.productCategory.count()]);
        return {data:rows.map(datedRow),total};
      },
    },
    gallery: {
      one: async (id: string) => { const row = await db.productImage.findUnique({where:{id}}); return row && datedRow(row); },
      list: async (skip: number,take: number) => {
        const [rows,total] = await db.$transaction([db.productImage.findMany({skip,take,orderBy}),db.productImage.count()]);
        return {data:rows.map(datedRow),total};
      },
    },
    businesses: {
      one: async (id: string) => { const row = await db.business.findUnique({where:{id}}); return row && datedRow(row); },
      list: async (skip: number,take: number) => {
        const [rows,total] = await db.$transaction([db.business.findMany({skip,take,orderBy}),db.business.count()]);
        return {data:rows.map(datedRow),total};
      },
    },
    socials: {
      one: async (id: string) => { const row = await db.socialLink.findUnique({where:{id}}); return row && datedRow(row); },
      list: async (skip: number,take: number) => {
        const [rows,total] = await db.$transaction([db.socialLink.findMany({skip,take,orderBy}),db.socialLink.count()]);
        return {data:rows.map(datedRow),total};
      },
    },
    inquiries: {
      one: async (id: string) => { const row = await db.inquiry.findUnique({where:{id}}); return row && inquiryRow(row); },
      list: async (skip: number,take: number) => {
        const [rows,total] = await db.$transaction([db.inquiry.findMany({skip,take,orderBy}),db.inquiry.count()]);
        return {data:rows.map(inquiryRow),total};
      },
    },
  };
}
