import { Closing, Eyebrow, Portrait, SocialLinks } from '@/components/site';
import { getSettings, getSocials } from '@/lib/data';
import { mediaUrl } from '@/lib/media';
import { JsonLd, pageMetadata } from '@/lib/seo';
import { siteOrigin } from '@/lib/env';
import { safeHttps } from '@/lib/validation';
export async function generateMetadata() {
  const s = await getSettings();
  return pageMetadata('/ceo', s.ceo_name, s.ceo_bio, mediaUrl(s.ceo_portrait) ?? undefined);
}
export default async function CEO() {
  const [s, links] = await Promise.all([getSettings(), getSocials()]);
  const socials = links.filter(link => link.scope === 'ceo');
  const origin = siteOrigin();
  const portrait = mediaUrl(s.ceo_portrait);
  return <>
    <JsonLd value={{'@context':'https://schema.org','@type':'Person',name:s.ceo_name,jobTitle:s.ceo_designation,url:origin + '/ceo',worksFor:{'@id':origin + '/#organization',name:s.company_name}, ...(portrait && {image:new URL(portrait, origin).href}),sameAs:socials.flatMap(s=>safeHttps(s.url) ?? [])}} />
    <section className="section ceo-page"><div className="shell split"><Portrait settings={s} /><div>
      <Eyebrow>Leadership</Eyebrow><h1>{s.ceo_name}</h1><p className="kicker">{s.ceo_designation}</p><p className="lede preserve">{s.ceo_bio}</p><h2>Entrepreneurial vision</h2><p className="preserve">{s.ceo_vision}</p><SocialLinks links={socials} />
    </div></div></section><Closing />
  </>;
}