import { BusinessCards, Closing, PageIntro } from '@/components/site';
import { getBusinesses } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
export const generateMetadata = () => pageMetadata('/businesses', 'Our Businesses', 'Explore the e-commerce, logistics, and technology businesses of RAFIUL ANAM LLC.');
export default async function Businesses() {
  const businesses = await getBusinesses();
  return <><PageIntro label="Our businesses" title="Independent businesses. A shared vision."><p>Explore our e-commerce businesses in the United States and Bangladesh, logistics in Spain, and technology for international markets.</p></PageIntro><section className="section"><div className="shell"><BusinessCards businesses={businesses} /></div></section><Closing /></>;
}
