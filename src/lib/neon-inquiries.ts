import 'server-only';
import { createHmac, randomInt } from 'node:crypto';
import { inquiryKind } from './neon-data';
import { prisma } from './prisma';
import type { InquiryInput } from './validation';

export async function storeInquiry(input: InquiryInput, ipHash: string, secret: string) {
  const db = prisma();
  const period = 60 * 60 * 1000;
  const hour = new Date(Math.floor(Date.now() / period) * period);
  const email = input.email.toLowerCase();
  const emailHash = createHmac('sha256',secret).update('email:' + email).digest('hex');
  if (randomInt(64) === 0) await db.inquiryRateLimit.deleteMany({where:{hour:{lt:new Date(hour.getTime() - period)}}});

  return db.$transaction(async tx => {
    // Always lock the IP counter before the email counter across requests.
    for (const [bucket,limit] of [['ip:' + ipHash,8],['email:' + emailHash,3]] as const) {
      const created = await tx.inquiryRateLimit.createMany({data:{bucket,hour},skipDuplicates:true});
      if (created.count) continue;
      const reserved = await tx.inquiryRateLimit.updateMany({
        where:{bucket,hour,hits:{lt:limit}},data:{hits:{increment:1}},
      });
      if (!reserved.count) return 'limited';
    }
    await tx.inquiry.create({data:{
      name:input.name,email,company:input.company || null,kind:inquiryKind(input.kind),message:input.message,
    }});
    return 'accepted';
  });
}
