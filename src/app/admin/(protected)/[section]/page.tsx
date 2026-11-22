import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/db';
import { dateLabel } from '@/lib/admin-data';
import { BusinessEditor, CategoryEditor, CEOEditor, InquiryEditor, SiteSettingsEditor, SocialEditor } from '@/components/admin-content';
import { Button } from '@/components/ui/button';
import { neonAdminProducts, neonAdminInquiries, neonAdminSettings, neonCategories } from '@/lib/neon-admin-data';

const sections = ['products','categories','businesses','ceo','inquiries','settings'];
const pageSize = 25;
function Pagination({path,page,count}: {path:string;page:number;count:number}) {
  if (count <= pageSize && page === 1) return null;
  return <nav className="actions admin-pagination" aria-label="Pagination">
    {page > 1 && <Link className="text-link" href={path + '?page=' + (page - 1)}>Previous page</Link>}
    <span>Page {page}</span>
    {count > page * pageSize && <Link className="text-link" href={path + '?page=' + (page + 1)}>Next page</Link>}
  </nav>;
}
export default async function AdminSection({params,searchParams}: {params:Promise<{section:string}>;searchParams:Promise<{page?:string}>}) {
  const [{section},search,{db}] = await Promise.all([params,searchParams,requireAdmin()]);
  if (!sections.includes(section)) notFound();
  const page = /^\d{1,6}$/.test(search.page ?? '') ? Math.max(1,Number(search.page)) : 1;
  const start = (page - 1) * pageSize;
  if (section === 'products') {
    const {rows,count} = await neonAdminProducts(db,start,pageSize);
    return <><div className="section-heading"><h1>Products</h1><Button asChild><Link href="/admin/products/new">Add product</Link></Button></div>
      <section className="admin-panel">{rows.length ? <ul className="clean admin-activity">{rows.map(p => <li key={p.id}><Link className="text-link" href={'/admin/products/' + p.id}>{p.name}</Link><span>{p.published ? 'Published' : 'Draft'}{p.featured ? ' · Featured' : ''}</span><time dateTime={p.updated_at}>{dateLabel(p.updated_at)}</time></li>)}</ul> : <p className="muted">No products on this page.</p>}</section>
      <Pagination path="/admin/products" page={page} count={count} />
    </>;
  }
  if (section === 'categories') {
    const rows = await neonCategories(db);
    return <><h1>Categories</h1><section className="admin-panel"><h2>Add a category</h2><CategoryEditor /></section>
      {rows.length > 0 && <section className="admin-panel"><h2>Existing categories</h2>{rows.map(row => <CategoryEditor key={row.id} category={row} />)}</section>}
    </>;
  }
  if (section === 'businesses') {
    const rows = await db.business.findMany({orderBy:[{display_order:'asc'},{name:'asc'}]});
    return <><h1>Business profiles</h1>{rows.map(b => <BusinessEditor key={b.id} business={b} />)}</>;
  }
  if (section === 'inquiries') {
    const {rows,count} = await neonAdminInquiries(db,start,pageSize);
    return <><h1>Contact inquiries</h1>{rows.length ? rows.map(row => <InquiryEditor key={row.id} item={row} />) : <p className="admin-panel muted">No inquiries on this page.</p>}
      <Pagination path="/admin/inquiries" page={page} count={count} />
    </>;
  }
  const scope = section === 'ceo' ? 'ceo' : 'company';
  const [settings,links] = await neonAdminSettings(db,scope);
  return <><h1>{scope === 'ceo' ? 'CEO profile' : 'Website settings'}</h1>
    <section className="admin-panel"><h2>{scope === 'ceo' ? 'Profile information' : 'Company information'}</h2>{scope === 'ceo' ? <CEOEditor settings={settings} /> : <SiteSettingsEditor settings={settings} />}</section>
    <section className="admin-panel"><h2>Social links</h2><SocialEditor scope={scope} />{links.map(link => <SocialEditor key={link.id} scope={scope} link={link} />)}</section>
  </>;
}
