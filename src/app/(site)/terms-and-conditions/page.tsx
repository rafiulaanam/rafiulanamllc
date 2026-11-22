import Link from 'next/link';
import { PageIntro } from '@/components/site';
import { getSettings } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
export const generateMetadata = () => pageMetadata('/terms-and-conditions', 'Terms and Conditions', 'Terms for browsing the corporate website and its Amazon product catalogue.');
export default async function Terms() {
  const settings = await getSettings();
  return <><PageIntro label="Website policies" title="Terms and Conditions" />
    <section className="section"><div className="shell prose-page">
      <p>This site provides information about {settings.company_name}, its businesses, and selected products listed on Amazon USA.</p>
      <h2>Product listings</h2><p>Product links open Amazon USA, where you can confirm details, price, availability, and applicable purchase terms. Orders are placed on Amazon.</p>
      <h2>Business websites</h2><p>Independent business websites may publish separate terms for their services. Review those terms when visiting a linked website.</p>
      <h2>Contact</h2><p>Use the <Link className="text-link" href="/contact">contact page</Link> for questions about this website.</p>
    </div></section></>;
}