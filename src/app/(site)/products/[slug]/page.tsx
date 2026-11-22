import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AmazonButton, Gallery, Price } from '@/components/catalogue';
import { Eyebrow } from '@/components/site';
import { getProduct } from '@/lib/data';
import { mediaUrl } from '@/lib/media';
import { pageMetadata } from '@/lib/seo';
type Props = {params: Promise<{slug: string}>};
async function productFor(params: Props['params']) {
  const {slug} = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return product;
}
export async function generateMetadata({params}: Props) {
  const product = await productFor(params);
  return pageMetadata('/products/' + product.slug, product.name, product.short_description, mediaUrl(product.image) ?? undefined);
}
export default async function ProductDetail({params}: Props) {
  const product = await productFor(params);
  return <section className="section"><div className="shell"><Link className="text-link breadcrumb" href="/products">All products</Link>
    <div className="split detail-split"><Gallery product={product} /><div className="product-detail">
      <Eyebrow>{product.product_categories?.name ?? 'Amazon USA'}</Eyebrow><h1>{product.name}</h1><p className="lede">{product.short_description}</p><Price product={product} /><div className="actions"><AmazonButton url={product.amazon_url} /></div><p className="muted">Check the Amazon listing for current price and availability.</p>
    </div></div><div className="product-description"><h2>Product description</h2><p className="preserve">{product.description}</p></div>
  </div></section>;
}