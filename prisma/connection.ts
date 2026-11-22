import nextEnv from '@next/env';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { neonDirectUrl } from '../src/lib/backend.ts';

nextEnv.loadEnvConfig(process.cwd(),false);

export function connectForMigration() {
  const connectionString = neonDirectUrl();
  if (!connectionString) throw new Error('Configure DATABASE_URL_UNPOOLED for this database operation.');
  return new PrismaClient({adapter:new PrismaNeon({connectionString,max:1,connectionTimeoutMillis:10_000})});
}
