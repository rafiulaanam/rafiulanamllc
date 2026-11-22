import type { Metadata } from 'next';
import { getSettings } from './data';
import { siteOrigin } from './env';

export async function pageMetadata(path: string, title?: string, description?: string, image = '/media/hero.webp'): Promise<Metadata> {
  const settings = await getSettings();
  const fullTitle = title ? title + ' | ' + settings.seo_title : settings.seo_title;
  const summary = description ?? settings.seo_description;
  const url = new URL(path, siteOrigin()).href;
  return { title: fullTitle, description: summary, alternates: { canonical: url },
    openGraph: {title: fullTitle, description: summary, url, type: 'website', siteName: settings.company_name, images: [image]},
    twitter: {card: 'summary_large_image', title: fullTitle, description: summary, images: [image]} };
}
export function JsonLd({value}: {value: Record<string, unknown>}) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(value).replace(/</g, '\\u003c')}} />;
}