import 'server-only';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@/generated/prisma/client';
import { neonUrl } from './backend';

const cache = globalThis as typeof globalThis & { corporatePrisma?: PrismaClient };
let client: PrismaClient | undefined;

export function prisma() {
  const existing = client ?? cache.corporatePrisma;
  if (existing) return existing;
  const adapter = new PrismaNeon({ connectionString: neonUrl(), max: 5, connectionTimeoutMillis: 10_000 });
  client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== 'production') cache.corporatePrisma = client;
  return client;
}
