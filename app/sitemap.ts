import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return siteConfig.navigation.map((item) => ({
    url: new URL(item.href, siteConfig.baseUrl).toString(),
    lastModified: new Date("2026-09-06"),
    changeFrequency: item.href === "/journal" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : item.href === "/contact" ? 0.9 : 0.8,
  }));
}
