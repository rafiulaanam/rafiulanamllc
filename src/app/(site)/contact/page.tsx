import { ContactForm } from '@/components/contact-form';
import { PageIntro } from '@/components/site';
import { getSettings } from '@/lib/data';
import { inquirySecret } from '@/lib/env';
import { pageMetadata } from '@/lib/seo';
import { databaseConfigured } from '@/lib/backend';
export const generateMetadata = () => pageMetadata('/contact', 'Contact', 'Contact RAFIUL ANAM LLC for corporate questions and partnership opportunities.');
export default async function Contact() {
  const settings = await getSettings();
  const enabled = databaseConfigured() && Boolean(inquirySecret());
  return <><PageIntro label="Contact" title="Let’s talk."><p>Reach out about corporate questions, business partnerships, or new opportunities.</p></PageIntro>
    <section className="section"><div className="shell split contact-grid">
      <aside><h2>Corporate inquiries</h2><p className="muted">Tell us which business your inquiry relates to and what you’d like to discuss.</p>
        {settings.contact_email && <p><a className="text-link" href={'mailto:' + settings.contact_email}>{settings.contact_email}</a></p>}
        {settings.contact_phone && <p><a className="text-link" href={'tel:' + settings.contact_phone}>{settings.contact_phone}</a></p>}
      </aside>
      <div className="contact-panel"><h2>Send a message</h2>{enabled ? <ContactForm /> : <p className="form-notice">The online inquiry form is currently unavailable.</p>}</div>
    </div></section></>;
}
