import 'server-only';
import { auth, verifyToken } from '@clerk/nextjs/server';
import { clerkKeys } from './backend';
import { siteOrigin } from './env';
import { prisma } from './prisma';

export async function clerkAdministrator(subject: string) {
  return prisma().user.findFirst({
    where: { clerkId: subject, disabledAt: null, roles: { some: { role: 'admin' } } },
    select: { id: true, clerkId: true, displayName: true },
  });
}

export async function clerkAdminSession() {
  const session = await auth();
  return session.userId ? clerkAdministrator(session.userId) : null;
}

export async function verifiedClerkSubject(token: string) {
  const { secretKey } = clerkKeys();
  const origin = siteOrigin();
  try {
    const claims = await verifyToken(token, { secretKey, authorizedParties: [origin] });
    return claims.azp === origin && typeof claims.sid === 'string' &&
      typeof claims.sub === 'string' && claims.sub.startsWith('user_') ? claims.sub : null;
  } catch {
    return null;
  }
}
