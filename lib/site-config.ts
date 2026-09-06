import type { Metadata } from "next";
import site from "@/content/site.json";

export type PageKey = keyof typeof site.pages;
export const siteConfig = site;

export function pageMetadata(key: PageKey): Metadata {
  const page = site.pages[key];
  const canonical = new URL(page.path, site.baseUrl).toString();

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      title: page.openGraph.title,
      description: page.openGraph.description,
      type: "website",
      siteName: site.openGraph.siteName,
      locale: site.openGraph.locale,
      url: canonical,
      images: [{ url: site.openGraph.image, width: 1200, height: 630, alt: page.openGraph.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.openGraph.title,
      description: page.openGraph.description,
      images: [site.openGraph.image],
    },
  };
}
