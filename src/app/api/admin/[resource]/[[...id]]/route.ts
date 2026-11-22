import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminRecordError } from '@/lib/admin-validation';
import { AdminInputError } from '@/lib/uploads';
import { adminConfigured } from '@/lib/backend';
import { clerkAdministrator, verifiedClerkSubject } from '@/lib/clerk-admin';
import { prisma } from '@/lib/prisma';
import { datedRow } from '@/lib/neon-data';
import { neonAdminResources } from '@/lib/neon-admin-data';
import { mutateNeonAdminContent } from '@/lib/neon-admin-mutations';

type Resource = {
  save: string;
  create?: boolean;
  remove?: string;
  singleton?: boolean;
};
type ResourceName = keyof ReturnType<typeof neonAdminResources> | 'settings' | 'ceo';
const resources: Record<ResourceName, Resource> = {
  products: {save:'product',create:true,remove:'delete-product'},
  categories: {save:'category',create:true,remove:'delete-category'},
  gallery: {save:'gallery',create:true,remove:'delete-gallery'},
  businesses: {save:'business'},
  settings: {save:'settings',singleton:true},
  ceo: {save:'ceo',singleton:true},
  socials: {save:'social',create:true,remove:'delete-social'},
  inquiries: {save:'inquiry',remove:'delete-inquiry'},
};
const maximumBodySize = 4 * 1024 * 1024;
const pagination = z.object({
  page: z.coerce.number().int().min(1).max(10000),
  limit: z.coerce.number().int().min(1).max(100),
});
const payloadSchema = z.record(z.string(), z.union([
  z.string(), z.number(), z.boolean(), z.null(), z.array(z.string()),
]));
type Context = {params: Promise<{resource:string; id?:string[]}>};

function json(data: unknown, status = 200, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Cache-Control','private, no-store');
  return NextResponse.json(data,{status,headers:responseHeaders});
}
function failure(status: number, error: string) {
  return json({error},status,status === 401 ? {'WWW-Authenticate':'Bearer'} : undefined);
}
async function readBody(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  const mediaType = contentType.split(';')[0].trim().toLowerCase();
  if (!['application/json','multipart/form-data'].includes(mediaType)) {
    throw new AdminRecordError('Send JSON or multipart form data.',415);
  }
  if (Number(request.headers.get('content-length')) > maximumBodySize) {
    throw new AdminRecordError('The request exceeds 4 MB.',413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AdminInputError('A request body is required.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBodySize) {
        await reader.cancel();
        throw new AdminRecordError('The request exceeds 4 MB.',413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Response(Uint8Array.from(Buffer.concat(chunks)),{headers:{'Content-Type':contentType}});
  try {
    if (mediaType === 'multipart/form-data') return await body.formData();
    const parsed = payloadSchema.safeParse(await body.json());
    if (!parsed.success) throw new Error('Invalid payload');
    const form = new FormData();
    for (const [key,value] of Object.entries(parsed.data)) {
      if (Array.isArray(value) && key !== 'capabilities') throw new Error('Unexpected array');
      form.set(key,Array.isArray(value) ? value.join('\n') : value === null ? '' : String(value));
    }
    return form;
  } catch {
    throw new AdminInputError('The request body is invalid.');
  }
}
async function handle(request: Request, {params}: Context) {
  const token = /^Bearer ([A-Za-z0-9_.-]{1,8192})$/i.exec(request.headers.get('authorization') ?? '')?.[1];
  if (!token) return failure(401,'An administrator session token is required.');
  try {
    const session = await authenticate(token);
    if (session instanceof NextResponse) return session;

    const {resource:rawName,id:segments = []} = await params;
    if (!Object.hasOwn(resources,rawName)) return failure(404,'Resource not found.');
    const name = rawName as ResourceName;
    const resource = resources[name];
    const [id,subresource] = segments;
    const markRead = name === 'inquiries' && Boolean(id) && subresource === 'read';
    if (segments.length > 2 || (subresource && !markRead) ||
      (id && (resource.singleton || !z.uuid().safeParse(id).success))) {
      return failure(404,'Resource not found.');
    }
    const allowed = markRead ? ['POST'] : id
      ? ['GET','PUT',...(resource.remove ? ['DELETE'] : [])]
      : ['GET',...(resource.create ? ['POST'] : []),...(resource.singleton ? ['PUT'] : [])];
    if (!allowed.includes(request.method)) {
      return json({error:'Method not allowed.'},405,{Allow:allowed.join(', ')});
    }
    if (request.method === 'GET') return await readResource(name,request,id);

    const form = markRead || request.method === 'DELETE' ? new FormData() : await readBody(request);
    form.set('operation',markRead ? 'mark-read' : request.method === 'DELETE' ? resource.remove! : resource.save);
    form.delete('id');
    if (id) form.set('id',id);
    for (const flag of ['published','featured']) {
      if (!['1','true','on'].includes(String(form.get(flag)))) form.delete(flag);
    }
    const result = await mutateNeonAdminContent(prisma(),session.actorId,form);
    revalidatePath('/','layout');
    return json({id:result.id ?? id},request.method === 'POST' && !markRead ? 201 : 200);
  } catch (error) {
    if (error instanceof AdminInputError) {
      return failure(error instanceof AdminRecordError ? error.status : 400,error.message);
    }
    console.error('Admin API request failed',error instanceof Error ? error.name : 'Database error');
    return failure(500,'The request could not be completed.');
  }
}

async function authenticate(token: string) {
  if (!adminConfigured()) return failure(503,'Administration is unavailable.');
  const subject = await verifiedClerkSubject(token);
  if (!subject) return failure(401,'The access token is invalid or expired.');
  const actor = await clerkAdministrator(subject);
  return actor ? {actorId:actor.id} : failure(403,'Administrator access is required.');
}

async function readResource(name: ResourceName, request: Request, id?: string) {
  const db = prisma();
  if (name === 'settings' || name === 'ceo') {
    const data = await db.siteSetting.findUnique({where:{singleton:true}});
    if (!data) return failure(404,'Record not found.');
    if (name === 'settings') return json({data:datedRow(data)});
    const {id,ceo_name,ceo_designation,ceo_bio,ceo_vision,ceo_portrait} = data;
    return json({data:{id,ceo_name,ceo_designation,ceo_bio,ceo_vision,ceo_portrait}});
  }
  const repo = neonAdminResources(db)[name];
  if (id) {
    const data = await repo.one(id);
    return data ? json({data}) : failure(404,'Record not found.');
  }
  const params = new URL(request.url).searchParams;
  const parsed = pagination.safeParse({page:params.get('page') ?? 1,limit:params.get('limit') ?? 25});
  if (!parsed.success) return failure(400,'Use a positive page and a limit between 1 and 100.');
  const {page,limit} = parsed.data;
  return json({...await repo.list((page - 1) * limit,limit),page,limit});
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
