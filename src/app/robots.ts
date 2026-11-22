import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/env';
export default function robots(): MetadataRoute.Robots {
  const url = siteOrigin();
  return {rules:{userAgent:'*',allow:'/',disallow:'/admin'},sitemap:url + '/sitemap.xml'};
}
