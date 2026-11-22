import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextResponse, type NextRequest } from 'next/server';
import { databaseConfigured } from '@/lib/backend';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!databaseConfigured() || !secret || !/^whsec_[A-Za-z0-9+/=_-]+$/.test(secret)) return new Response(null,{status:404});
  if (Number(request.headers.get('content-length')) > 512 * 1024) return new Response(null,{status:413});
  const event = await verifyWebhook(request,{signingSecret:secret}).catch(() => null);
  if (!event) return new Response(null,{status:400});
  if (event.type === 'user.deleted' && event.data.id) {
    // The conditional update makes duplicate deliveries harmless and keeps the audit references.
    await prisma().user.updateMany({where:{clerkId:event.data.id,disabledAt:null},data:{disabledAt:new Date()}});
  }
  return NextResponse.json({received:true});
}
