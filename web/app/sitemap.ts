import type { MetadataRoute } from "next";

import { NAV, siteUrl } from "@/lib/site";
import { getSettings } from "@/lib/store";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = siteUrl((await getSettings()).url);
  return NAV.map((item) => ({
    url: `${url}${item.href === "/" ? "" : item.href}`,
    changeFrequency: item.href === "/katalog" ? "daily" : "weekly",
    priority: item.href === "/" ? 1 : item.href === "/katalog" ? 0.9 : 0.7,
  }));
}
