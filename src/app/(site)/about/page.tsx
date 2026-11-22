import Link from 'next/link';
import { Closing, Eyebrow, Markets, PageIntro } from '@/components/site';
import { Button } from '@/components/ui/button';
import { getBusinesses, getSettings } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
export const generateMetadata = () => pageMetadata('/about', 'About', 'Learn about RAFIUL ANAM LLC and its entrepreneurial vision across commerce, logistics, and technology.');
export default async function About() {
  const [settings, businesses] = await Promise.all([getSettings(), getBusinesses()]);
  return <><PageIntro label="About the company" title={settings.positioning}><p>{settings.introduction}</p></PageIntro>
    <section className="section"><div className="shell editorial"><div><Eyebrow>Our focus</Eyebrow><h2>One Vision. Multiple Business Opportunities.</h2></div><div><p>Each business serves its own market. Amazon e-commerce connects products with customers in the United States, and ANAMCART operates a multi-category online marketplace in Bangladesh. ANAMIGO Fleet focuses on delivery operations in Spain, and ANAMSOFT develops software and digital products for an international audience.</p><Button asChild variant="outline"><Link href="/businesses">Explore Our Businesses</Link></Button></div></div></section>
    <Markets businesses={businesses} /><Closing /></>;
}
