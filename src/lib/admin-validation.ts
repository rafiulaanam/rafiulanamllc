import 'server-only';
import { z } from 'zod';
import { inquiryKinds, inquiryStatuses } from './content';
import { amazonLink, httpsSchema, slugSchema } from './validation';
import { AdminInputError } from './uploads';

export class AdminRecordError extends AdminInputError {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}
export const idSchema = z.uuid();
const text = (max: number) => z.string().trim().min(1).max(max);
const order = z.coerce.number().int().min(-100000).max(100000);
const amazon = text(2048).transform((value, ctx) => {
  const url = amazonLink(value);
  if (url) return url;
  ctx.addIssue({code:'custom', message:'Enter a direct Amazon USA product listing URL.'});
  return z.NEVER;
});
export const productSchema = z.object({
  name:text(160),slug:slugSchema,short_description:text(400),description:text(8000),
  image_alt:z.string().trim().max(240),category_id:z.union([z.literal(''),idSchema]).transform(value => value || null),
  amazon_url:amazon,price:z.string().trim().regex(/^(?:\d{1,10}(?:\.\d{1,2})?)?$/, 'Enter a nonnegative price with up to two decimal places.').transform(value => value ? Number(value) : null),
  currency:z.string().trim().toUpperCase().refine(value => Intl.supportedValuesOf('currency').includes(value), 'Enter a supported ISO currency such as USD.'),
  display_order:order,
});
export const businessSchema = z.object({
  name:text(120),label:text(80),location:text(120),description:text(500),overview:text(4000),
  capabilities:text(1500).transform(value => [...new Set(value.split('\n').map(line => line.trim()).filter(Boolean))]),
  image_alt:text(240),external_url:httpsSchema,display_order:order,
});
export const settingsSchema = z.object({
  company_name:text(120),introduction:text(2400),positioning:text(220),footer_text:text(600),
  contact_email:z.union([z.literal(''),z.string().email().max(254)]).transform(value => value || null),
  contact_phone:z.string().trim().max(40).regex(/^(?:\+?[0-9][0-9(). -]*)?$/, 'Enter a valid phone number.').transform(value => value || null),
  seo_title:text(80),seo_description:text(190),
});
export const ceoSchema = z.object({ceo_name:text(120),ceo_designation:text(150),ceo_bio:text(5000),ceo_vision:text(4000)});
export const categorySchema = z.object({name:text(100),slug:slugSchema});
export const socialSchema = z.object({
  scope:z.enum(['company','ceo']),label:text(100),
  url:httpsSchema.pipe(z.string({error:'Enter a website URL.'})),display_order:order,
});
export const inquirySchema = z.object({kind:z.enum(inquiryKinds),status:z.enum(inquiryStatuses)});
export const gallerySchema = z.object({product_id:idSchema,alt:text(240),display_order:order});

export function parse<S extends z.ZodType>(schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  throw new AdminInputError(result.error.issues.map(issue => {
    const field = String(issue.path[0] ?? 'value').replaceAll('_',' ');
    return field.charAt(0).toUpperCase() + field.slice(1) + ' — ' + issue.message;
  }).join(' '));
}

