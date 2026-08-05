import { siteUrl } from "@/lib/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/cart", "/checkout", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
