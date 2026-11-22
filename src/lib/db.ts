import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { adminConfigured } from './backend';
import { clerkAdminSession } from './clerk-admin';
import { prisma } from './prisma';

export const adminSession = cache(async () => {
  if (!adminConfigured()) return null;
  const user = await clerkAdminSession();
  return user ? {db:prisma(),user} : null;
});

export async function requireAdmin() {
  const session = await adminSession();
  if (!session) redirect('/admin/login');
  return session;
}
