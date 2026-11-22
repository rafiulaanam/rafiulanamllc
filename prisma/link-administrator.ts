import { z } from 'zod';
import { clerkKeys } from '../src/lib/backend.ts';
import { connectForMigration } from './connection.ts';

async function run() {
  const [recordId,clerkId,mode,...extra] = process.argv.slice(2);
  if ((recordId !== 'first-admin' && !z.uuid().safeParse(recordId).success) ||
      !/^user_[A-Za-z0-9]+$/.test(clerkId ?? '') || mode !== '--apply' || extra.length) {
    throw new Error('Usage: npm run db:link-admin -- <existing-admin-uuid|first-admin> <verified-clerk-user-id> --apply');
  }
  const response = await fetch('https://api.clerk.com/v1/users/' + clerkId,{
    headers:{Authorization:'Bearer ' + clerkKeys().secretKey},signal:AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error('Clerk did not confirm the account.');
  const user = z.object({
    id:z.string(),primary_email_address_id:z.string().nullable(),
    email_addresses:z.object({id:z.string(),verification:z.object({status:z.string()}).nullable()}).array(),
  }).parse(await response.json());
  if (user.id !== clerkId || !user.email_addresses.some(address =>
      address.id === user.primary_email_address_id && address.verification?.status === 'verified')) {
    throw new Error('Link an account with a verified primary email address.');
  }
  const db = connectForMigration();
  try {
    if (recordId === 'first-admin') {
      await db.$transaction(async tx => {
        if (await tx.userRole.count({where:{role:'admin'}})) throw new Error('An administrator role already exists.');
        await tx.user.create({data:{clerkId,roles:{create:{role:'admin'}}}});
      },{isolationLevel:'Serializable'});
      console.log('Verified Clerk account provisioned as the first administrator.');
      return;
    }
    const {count} = await db.user.updateMany({
      where:{id:recordId,disabledAt:null,roles:{some:{role:'admin'}},OR:[{clerkId:null},{clerkId}]},data:{clerkId},
    });
    if (!count) throw new Error('No eligible existing administrator matched the requested link.');
    console.log('Verified Clerk account linked to the existing administrator role.');
  } finally { await db.$disconnect(); }
}

run().catch(() => {
  console.error('Administrator link failed. Check the approved identifiers, account verification, and staging configuration.');
  process.exitCode = 1;
});
