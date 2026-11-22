import { z } from 'zod';

export function databaseConfigured() { return Boolean(process.env.DATABASE_URL); }

export function adminConfigured() {
  return databaseConfigured() && Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

const postgresUrl = z.url().refine(value => {
  const url = new URL(value);
  return ['postgresql:', 'postgres:'].includes(url.protocol) && Boolean(url.username && url.pathname.length > 1) &&
    ['require', 'verify-ca', 'verify-full'].includes(url.searchParams.get('sslmode') ?? '');
});

export function neonUrl() {
  const url = postgresUrl.safeParse(process.env.DATABASE_URL);
  if (!url.success) throw new Error('Configure a pooled PostgreSQL DATABASE_URL with SSL for Neon.');
  return url.data;
}

export function neonDirectUrl() {
  if (!process.env.DATABASE_URL_UNPOOLED) return undefined;
  const parsed = postgresUrl.safeParse(process.env.DATABASE_URL_UNPOOLED);
  if (!parsed.success || new URL(parsed.data).hostname.includes('-pooler.')) {
    throw new Error('Configure a direct PostgreSQL DATABASE_URL_UNPOOLED with SSL for Prisma Migrate.');
  }
  return parsed.data;
}

export function clerkKeys() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!publishableKey || !/^pk_(test|live)_[\w-]+={0,2}$/.test(publishableKey) ||
      !secretKey || !/^sk_(test|live)_[\w-]+$/.test(secretKey) ||
      publishableKey.split('_')[1] !== secretKey.split('_')[1]) {
    throw new Error('Configure matching Clerk publishable and secret keys.');
  }
  return { publishableKey, secretKey };
}

export function cloudinaryCredentials() {
  const input = z.object({
    cloud_name: z.string().regex(/^[\w-]+$/),
    api_key: z.string().regex(/^\d+$/),
    api_secret: z.string().min(1),
  }).safeParse({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  if (!input.success) throw new Error('Configure Cloudinary cloud name, API key and API secret.');
  return input.data;
}
