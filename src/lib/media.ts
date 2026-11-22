export const companyLogo = '/media/rafiul-anam-logo.webp';
export const companyMonogram = '/media/rafiul-anam-monogram-light.webp';

export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^\/media\/[a-z0-9-]+\.webp$/.test(path)) return path;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName && path.startsWith('https://res.cloudinary.com/' + cloudName + '/image/upload/')) {
    const url = new URL(path);
    if (url.pathname.startsWith('/' + cloudName + '/image/upload/')) return url.href;
  }
  return null;
}
