import nextEnv from '@next/env';
import { defineConfig } from 'prisma/config';
import { neonDirectUrl } from './src/lib/backend';

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV === 'development');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: neonDirectUrl() },
});
