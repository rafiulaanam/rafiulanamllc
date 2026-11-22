import { z } from 'zod';
import { inquiryKinds } from './content';
export function safeHttps(value: string | null | undefined) {
  if (!value || /[\\\s]/.test(value)) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && url.hostname.includes('.') ? url.href : null;
  } catch { return null; }
}
export function amazonLink(value: string) {
  const safe = safeHttps(value);
  if (!safe) return null;
  const url = new URL(safe);
  if (!['www.amazon.com', 'amazon.com'].includes(url.hostname)) return null;
  return /^\/(?:[^/]+\/)?(?:dp|gp\/product)\/[A-Z0-9]{10}\/?$/i.test(url.pathname) ? url.href : null;
}
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160),
  kind: z.enum(inquiryKinds),
  message: z.string().trim().min(15).max(4000),
  website: z.string().max(200),
});
export type InquiryInput = z.input<typeof inquirySchema>;
export const slugSchema = z.string().trim().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, digits and hyphens.');
export const httpsSchema = z.string().trim().max(2048).transform((value, ctx) => {
  if (!value) return null;
  const safe = safeHttps(value);
  if (safe) return safe;
  ctx.addIssue({code: 'custom', message: 'Enter a valid HTTPS URL.'});
  return z.NEVER;
});