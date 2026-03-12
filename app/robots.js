import { siteUrl } from "../lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin/"
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
