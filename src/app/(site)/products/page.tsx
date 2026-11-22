import Link from 'next/link';
import { Search } from 'lucide-react';
import { ProductGrid } from '@/components/catalogue';
import { PageIntro } from '@/components/site';
import { Button } from '@/components/ui/button';
import { browseProducts, cataloguePageSize } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { slugSchema } from '@/lib/validation';

export const generateMetadata = () => pageMetadata('/products', 'Products', 'Browse selected products and find their listings on Amazon USA.');
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export default async function Products({searchParams}: {searchParams:SearchParams}) {
  const params = await searchParams;
  const search = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : '';
  const parsedCategory = slugSchema.safeParse(params.category);
  const category = parsedCategory.success ? parsedCategory.data : '';
  const page = typeof params.page === 'string' && /^\d{1,5}$/.test(params.page) ? Math.max(1,Number(params.page)) : 1;
  const {products,categories,count} = await browseProducts(search,category,page);
  function pageLink(number: number) {
    const query = new URLSearchParams();
    if (search) query.set('q',search);
    if (category) query.set('category',category);
    if (number > 1) query.set('page',String(number));
    return '/products' + (query.size ? '?' + query : '');
  }
  return <><PageIntro label="Amazon USA" title="Product catalogue."><p>Browse selected products and view current availability on Amazon USA.</p></PageIntro>
    <section className="section"><div className="shell"><h2 className="sr-only">Browse products</h2>
      <form className="filters catalogue-filters" action="/products">
        <label>Search products<span className="search-field"><Search size={18} aria-hidden="true" /><input name="q" type="search" maxLength={100} defaultValue={search} placeholder="Search by product name" /></span></label>
        <label>Category<select name="category" defaultValue={category}><option value="">All categories</option>{categories.map(item => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
        <Button type="submit">Apply filters</Button>
      </form>
      <ProductGrid products={products} empty={search || category || page > 1 ? 'filtered' : 'catalogue'} />
      {(page > 1 || count > page * cataloguePageSize) && <nav className="actions admin-pagination" aria-label="Catalogue pagination">
        {page > 1 && <Link className="text-link" href={pageLink(page - 1)}>Previous page</Link>}
        <span>Page {page}</span>
        {count > page * cataloguePageSize && <Link className="text-link" href={pageLink(page + 1)}>Next page</Link>}
      </nav>}
    </div></section>
  </>;
}