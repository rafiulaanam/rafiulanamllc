'use server';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { headers } from 'next/headers';
import { inquirySecret } from '@/lib/env';
import { inquirySchema, type InquiryInput } from '@/lib/validation';
import { databaseConfigured } from '@/lib/backend';
import { storeInquiry } from '@/lib/neon-inquiries';

export async function submitInquiry(input: InquiryInput) {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Check the highlighted fields and try again.' };
  if (parsed.data.website) return { ok: true, message: 'Your inquiry has been received.' };
  const secret = inquirySecret();
  if (!databaseConfigured() || !secret) return { ok: false, message: 'The inquiry form is temporarily unavailable.' };
  const h = await headers();
  const proxyHeader = process.env.VERCEL === '1' ? 'x-vercel-forwarded-for' : process.env.INQUIRY_TRUSTED_IP_HEADER;
  const rawIp = proxyHeader ? h.get(proxyHeader)?.trim() : undefined;
  const ip = rawIp && isIP(rawIp) ? rawIp : 'shared';
  const bucket = createHmac('sha256', secret).update(ip).digest('hex');
  try {
    return (await storeInquiry(parsed.data,bucket,secret)) === 'accepted'
      ? {ok:true,message:'Your inquiry has been received.'}
      : {ok:false,message:'Too many inquiries were submitted. Please try again later.'};
  } catch (error) {
    console.error('Inquiry submission failed', error instanceof Error ? error.name : 'Database error');
    return {ok:false,message:'Your inquiry could not be sent. Please try again later.'};
  }
}

