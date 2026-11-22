import 'server-only';
import sharp from 'sharp';

export class AdminInputError extends Error {}
export async function prepareImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || !file.size) return null;
  if (file.size > 3 * 1024 * 1024) throw new AdminInputError('Choose an image smaller than 3 MB.');
  let image: Buffer;
  try {
    const decoder = sharp(Buffer.from(await file.arrayBuffer()), {limitInputPixels:24_000_000, failOn:'error'});
    const metadata = await decoder.metadata();
    if (!['jpeg','png','webp'].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
      throw new Error('Unsupported format');
    }
    image = await decoder.rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:83}).toBuffer();
  } catch {
    throw new AdminInputError('Use a valid JPG, PNG or WebP image within 24 megapixels.');
  }
  if (image.length > 2 * 1024 * 1024) throw new AdminInputError('Use a smaller source image.');
  return image;
}
