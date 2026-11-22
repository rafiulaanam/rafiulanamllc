import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import { siteOrigin } from '@/lib/env';
import { adminConfigured, clerkKeys } from '@/lib/backend';

export function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!adminConfigured()) return NextResponse.next({headers:{'Cache-Control':'private, no-store'}});
  clerkKeys();
  return clerkMiddleware(() => NextResponse.next({headers:{'Cache-Control':'private, no-store'}}),
    {authorizedParties:[siteOrigin()]})(request,event);
}

export const config = { matcher: ['/admin/:path*'], runtime: 'nodejs' };
