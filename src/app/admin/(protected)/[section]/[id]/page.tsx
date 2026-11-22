import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/db';
import { dateLabel } from '@/lib/admin-data';
import { ProductEditor, ProductGalleryEditor } from '@/components/admin-content';
import { AdminForm } from '@/components/admin-form';
import { neonAdminProduct, neonCategories } from '@/lib/neon-admin-data';

export default async function AdminProduct({params}: {params:Promise<{section:string;id:string}>}) {
  const [{section,id},{db}] = await Promise.all([params,requireAdmin()]);
  if (section !== 'products' || (id !== 'new' && !z.uuid().safeParse(id).success)) notFound();
  const creating = id === 'new';
  const [categories,product] = await Promise.all([neonCategories(db),creating ? null : neonAdminProduct(db,id)]);
  if (!creating && !product) notFound();
  return <><Link className="text-link breadcrumb" href="/admin/products">All products</Link><h1>{product?.name ?? 'Add product'}</h1>
    <section className="admin-panel"><h2>Product information</h2><ProductEditor key={id} product={product ?? undefined} categories={categories} />
      {product && <p className="muted admin-dates">Created {dateLabel(product.created_at)} · Updated {dateLabel(product.updated_at)}</p>}
    </section>
    {product && <><ProductGalleryEditor product={product} /><section className="admin-panel"><h2>Delete product</h2><AdminForm operation="delete-product" id={product.id} label="Delete product" remove /></section></>}
  </>;
}
