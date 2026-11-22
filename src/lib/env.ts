export function siteOrigin() {
  const value = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.href !== url.origin + '/') {
    throw new Error('NEXT_PUBLIC_SITE_URL must be a site origin.');
  }
  return url.origin;
}
export function inquirySecret() {
  const secret = process.env.INQUIRY_RATE_LIMIT_SECRET;
  return secret && /^[a-f0-9]{64}$/i.test(secret) ? secret : null;
}
