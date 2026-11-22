import Link from 'next/link';
import { PageIntro } from '@/components/site';
import { getSettings } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
export const generateMetadata = () => pageMetadata('/privacy-policy', 'Privacy Policy', 'How this website handles corporate inquiries and website data.');
export default async function Privacy() {
  const settings = await getSettings();
  return <><PageIntro label="Website policies" title="Privacy Policy" />
    <section className="section"><div className="shell prose-page">
      <p>This policy describes how {settings.company_name} handles information submitted through this website.</p>
      <h2>Inquiry information</h2><p>The contact form collects your name, email address, optional company, inquiry type, and message. Authorized administrators use this information to respond to and manage your inquiry.</p>
      <h2>Site operations and abuse prevention</h2><p>Hosting and database providers process information needed to operate the website. The form uses a keyed digest of a network identifier where available and a digest of your email address to limit repeated submissions. Rate-limit records can be removed after their hourly window ends.</p>
      <h2>External websites</h2><p>Links may take you to Amazon or an independent business website. Each destination has its own privacy practices.</p>
      <h2>Contact</h2><p>Use the <Link className="text-link" href="/contact">contact page</Link> for questions or requests about information you submitted.</p>
    </div></section></>;
}