import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";
import { getSettings } from "@/lib/store";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const url = siteUrl((await getSettings()).url);
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
