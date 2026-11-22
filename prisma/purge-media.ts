import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryCredentials } from '../src/lib/backend.ts';
import { connectForMigration } from './connection.ts';

async function run() {
  const [id,mode,...extra] = process.argv.slice(2);
  if (!z.uuid().safeParse(id).success || (mode && mode !== '--apply') || extra.length) {
    throw new Error('Usage: npm run db:purge-media -- <asset-uuid> [--apply]');
  }
  const db = connectForMigration();
  try {
    await db.$transaction(async tx => {
      // Hold the row lock until completion so a new foreign-key reference cannot attach during deletion.
      await tx.$queryRaw`SELECT id FROM media_assets WHERE id = ${id}::uuid FOR UPDATE`;
      const asset = await tx.mediaAsset.findFirst({
        where:{
          id,cloudinaryId:{not:null},orphanedAt:{not:null},deletedAt:null,
          businessImages:{none:{}},businessLogos:{none:{}},products:{none:{}},
          productImages:{none:{}},siteLogos:{none:{}},sitePortraits:{none:{}},
        },
      });
      if (!asset?.cloudinaryId || !/^rafiul-anam-llc\/(products|gallery|businesses|logos|leadership)\/[a-f0-9-]{36}$/.test(asset.cloudinaryId)) {
        throw new Error('The selected asset is referenced or protected.');
      }
      if (mode !== '--apply') {
        console.log('The selected unreferenced asset is eligible for an explicitly approved purge.');
        return;
      }
      const options = {
        ...cloudinaryCredentials(),resource_type:'image',type:'upload',invalidate:true,timeout:15_000,
      } as const;
      const {result} = await cloudinary.uploader.destroy(asset.cloudinaryId,options);
      if (result !== 'ok' && result !== 'not found') throw new Error('Cloudinary did not confirm deletion.');
      await tx.mediaAsset.update({where:{id},data:{deletedAt:new Date()}});
      console.log('Cloudinary deletion recorded.');
    },{timeout:30_000});
  } finally { await db.$disconnect(); }
}

run().catch(() => {
  console.error('Media purge was not confirmed. Check the asset status and retry if appropriate.');
  process.exitCode = 1;
});
