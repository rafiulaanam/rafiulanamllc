import 'server-only';
import { randomUUID } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryCredentials } from './backend';
import { AdminInputError, prepareImage } from './uploads';

export async function uploadCloudImage(file: FormDataEntryValue | null, folder: 'products' | 'gallery' | 'businesses' | 'logos' | 'leadership') {
  const content = await prepareImage(file);
  if (!content) return null;
  const credentials = cloudinaryCredentials();
  const publicId = 'rafiul-anam-llc/' + folder + '/' + randomUUID();
  const upload = await new Promise<import('cloudinary').UploadApiResponse>((resolve,reject) => {
    cloudinary.uploader.upload_stream({
      ...credentials,public_id:publicId,resource_type:'image',type:'upload',overwrite:false,
    },(error,result) => error || !result ? reject(error ?? new Error('Cloudinary returned no asset.')) : resolve(result)).end(content);
  });
  if (upload.public_id !== publicId || !upload.secure_url.startsWith('https://res.cloudinary.com/' + credentials.cloud_name + '/image/upload/')) {
    throw new AdminInputError('The image host returned an unexpected delivery URL.');
  }
  return {
    url:upload.secure_url,cloudinaryId:upload.public_id,format:upload.format,
    width:upload.width,height:upload.height,bytes:upload.bytes,
  };
}

export async function destroyCloudImage(publicId: string) {
  if (!/^rafiul-anam-llc\/(products|gallery|businesses|logos|leadership)\/[a-f0-9-]{36}$/.test(publicId)) {
    throw new Error('Refusing to delete a media asset outside the corporate upload folders.');
  }
  const {result} = await cloudinary.uploader.destroy(publicId,{
    ...cloudinaryCredentials(),resource_type:'image',type:'upload',invalidate:true,
  });
  if (result !== 'ok' && result !== 'not found') throw new Error('Cloudinary did not confirm deletion.');
}
