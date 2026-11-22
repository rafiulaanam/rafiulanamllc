import Link from 'next/link';
import Image from 'next/image';
import { mediaUrl } from '@/lib/media';
import type { Business, Category, Product, Settings, Social } from '@/lib/content';
import { inquiryKinds, inquiryStatuses } from '@/lib/content';
import { dateLabel } from '@/lib/admin-data';
import { AdminForm } from './admin-form';
import { Field, Flag, ImageField, LongField } from './admin-fields';

export function ProductEditor({product,categories}: {product?:Product;categories:Category[]}) {
  return <AdminForm operation="product" id={product?.id} label={product ? 'Save product' : 'Create product'}>
    <div className="form-pair"><Field name="name" label="Product name" value={product?.name} max={160} /><Field name="slug" label="URL slug" value={product?.slug} max={100} /></div>
    <Field name="amazon_url" label="Amazon USA listing URL" type="url" value={product?.amazon_url} max={2048} />
    <LongField name="short_description" label="Short description" value={product?.short_description} max={400} />
    <LongField name="description" label="Full description" value={product?.description} max={8000} />
    <div className="form-pair"><label>Category<select name="category_id" defaultValue={product?.category_id ?? ''}><option value="">Choose a category</option>{categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><Field name="display_order" label="Display order" type="number" value={product?.display_order ?? 0} /></div>
    <div className="form-pair"><Field name="price" label="Price (optional)" type="number" step=".01" min={0} value={product?.price} optional /><Field name="currency" label="ISO currency" value={product?.currency ?? 'USD'} max={3} /></div>
    <ImageField name="image" label="Main product image" path={product?.image} /><Field name="image_alt" label="Main image description" value={product?.image_alt} max={240} optional />
    <div className="form-pair"><Flag name="featured" label="Feature on the website" checked={product?.featured} /><Flag name="published" label="Publish to catalogue" checked={product?.published} /></div>
    <p className="muted">To save a draft without an image, leave the file field empty and keep publishing unchecked. Published products need a category, a main image, and an image description.</p>
    {!categories.length && <p className="muted">Create a <Link className="text-link" href="/admin/categories">category</Link> before publishing.</p>}
  </AdminForm>;
}
export function ProductGalleryEditor({product}: {product:Product}) {
  const images = [...(product.product_images ?? [])].sort((a,b) => a.display_order - b.display_order);
  return <section className="admin-panel"><h2>Product gallery</h2>
    <AdminForm operation="gallery" label="Add gallery image" clear>
      <input type="hidden" name="product_id" value={product.id} />
      <ImageField name="image" label="Gallery image" required />
      <div className="form-pair"><Field name="alt" label="Image description" max={240}/><Field name="display_order" label="Display order" type="number" value={0} /></div>
    </AdminForm>
    {images.map(image => <div className="admin-record" key={image.id}>
      <AdminForm operation="gallery" id={image.id}>
        <input type="hidden" name="product_id" value={product.id} />
        <ImageFieldPreview path={image.path} />
        <div className="form-pair"><Field name="alt" label="Image description" value={image.alt} max={240} /><Field name="display_order" label="Display order" type="number" value={image.display_order} /></div>
      </AdminForm>
      <AdminForm operation="delete-gallery" id={image.id} label="Delete gallery image" remove />
    </div>)}
  </section>;
}
function ImageFieldPreview({path}: {path:string}) {
  const src = mediaUrl(path);
  return src ? <Image src={src} alt="Gallery image" className="admin-thumbnail" width={100} height={72} /> : null;
}
export function BusinessEditor({business}: {business:Business & {published:boolean}}) {
  return <section className="admin-panel" id={'business-' + business.id}><h2>{business.name}</h2>
    <AdminForm operation="business" id={business.id}>
      <Field name="name" label="Business name" value={business.name} max={120} />
      <div className="form-pair"><Field name="label" label="Business area" value={business.label} max={80} /><Field name="location" label="Market / location" value={business.location} max={120} /></div>
      <LongField name="description" label="Short description" value={business.description} max={500} />
      <LongField name="overview" label="Overview" value={business.overview} max={4000} />
      <LongField name="capabilities" label="Capabilities (one per line)" value={business.capabilities.join('\n')} max={1500} />
      {business.slug === 'ecommerce' ? <input type="hidden" name="external_url" value="" /> : <Field name="external_url" label="Official website URL (optional)" type="url" value={business.external_url} max={2048} optional />}
      <ImageField name="image" label="Business photograph" path={business.image} />
      <Field name="image_alt" label="Photograph description" value={business.image_alt} max={240} />
      <ImageField name="logo" label="Business logo" path={business.logo} />
      <Field name="display_order" label="Display order" type="number" value={business.display_order} />
      <Flag name="published" label="Publish business profile" checked={business.published} />
    </AdminForm>
  </section>;
}
export function CategoryEditor({category}: {category?:Category}) {
  return <div className="admin-record"><AdminForm operation="category" id={category?.id} label={category ? 'Save category' : 'Add category'} clear={!category}>
    <div className="form-pair"><Field name="name" label="Category name" value={category?.name} max={100}/><Field name="slug" label="URL slug" value={category?.slug} max={100}/></div>
  </AdminForm>{category && <AdminForm operation="delete-category" id={category.id} label="Delete category" remove />}</div>;
}
export function SocialEditor({scope,link}: {scope:Social['scope'];link?:Social}) {
  return <div className="admin-record"><AdminForm operation="social" id={link?.id} label={link ? 'Save link' : 'Add link'} clear={!link}>
    <input type="hidden" name="scope" value={scope} />
    <div className="form-pair"><Field name="label" label="Link label" value={link?.label} max={100} /><Field name="url" label="HTTPS URL" value={link?.url} type="url" max={2048} /></div>
    <Field name="display_order" label="Display order" type="number" value={link?.display_order ?? 0} />
  </AdminForm>{link && <AdminForm operation="delete-social" id={link.id} label="Delete link" remove />}</div>;
}
export function SiteSettingsEditor({settings:s}: {settings:Settings}) {
  return <AdminForm operation="settings">
    <Field name="company_name" label="Company name" value={s.company_name} max={120} />
    <Field name="positioning" label="Company positioning" value={s.positioning} max={220} />
    <LongField name="introduction" label="Company introduction" value={s.introduction} max={2400}/>
    <ImageField name="brand_logo" label="Company logo" path={s.brand_logo} />
    <div className="form-pair"><Field name="contact_email" label="Public contact email" value={s.contact_email} type="email" max={254} optional /><Field name="contact_phone" label="Public phone number" value={s.contact_phone} type="tel" max={40} optional /></div>
    <LongField name="footer_text" label="Footer text" value={s.footer_text} max={600} />
    <Field name="seo_title" label="Default SEO title" value={s.seo_title} max={80} />
    <LongField name="seo_description" label="SEO description" value={s.seo_description} max={190} />
  </AdminForm>;
}
export function CEOEditor({settings:s}: {settings:Settings}) {
  return <AdminForm operation="ceo">
    <div className="form-pair"><Field name="ceo_name" label="CEO name" value={s.ceo_name} max={120}/><Field name="ceo_designation" label="Designation" value={s.ceo_designation} max={150}/></div>
    <ImageField name="ceo_portrait" label="Official portrait" path={s.ceo_portrait} />
    <LongField name="ceo_bio" label="Biography" value={s.ceo_bio} max={5000} />
    <LongField name="ceo_vision" label="Entrepreneurial vision" value={s.ceo_vision} max={4000} />
  </AdminForm>;
}
export const statusNames = {new:'New',in_progress:'In progress',closed:'Closed'} as const;
type Inquiry = {id:string;name:string;email:string;company:string | null;kind:string;message:string;status:string;read_at:string | null;created_at:string};
export function InquiryEditor({item}: {item:Inquiry}) {
  return <article className="admin-panel" id={'inquiry-' + item.id}>
    <h2>{item.name}</h2><p className="muted">{dateLabel(item.created_at)} · {item.read_at ? 'Read' : 'Unread'}</p>
    <a className="text-link" href={'mailto:' + item.email}>{item.email}</a>{item.company && <p>{item.company}</p>}
    <p className="preserve inquiry-message">{item.message}</p>
    <AdminForm operation="inquiry" id={item.id}>
      <div className="form-pair"><label>Category<select name="kind" defaultValue={item.kind}>{inquiryKinds.map(kind => <option key={kind}>{kind}</option>)}</select></label>
      <label>Status<select name="status" defaultValue={item.status}>{inquiryStatuses.map(status => <option value={status} key={status}>{statusNames[status]}</option>)}</select></label></div>
    </AdminForm>
    {!item.read_at && <AdminForm operation="mark-read" id={item.id} label="Mark as read" />}
    <AdminForm operation="delete-inquiry" id={item.id} label="Delete inquiry" remove />
  </article>;
}
