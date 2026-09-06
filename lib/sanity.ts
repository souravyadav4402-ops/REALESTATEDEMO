import { createClient } from "@sanity/client";
import { configuredValue, hasConfiguredValues, isConfiguredValue } from "@/lib/env";

const sanityConfigured = hasConfiguredValues("NEXT_PUBLIC_SANITY_PROJECT_ID");
const configuredReadToken = process.env.SANITY_API_READ_TOKEN;
const readToken = isConfiguredValue(configuredReadToken) ? configuredReadToken.trim() : undefined;

export const sanityClient = sanityConfigured ? createClient({
  projectId: configuredValue("NEXT_PUBLIC_SANITY_PROJECT_ID"),
  dataset: isConfiguredValue(process.env.NEXT_PUBLIC_SANITY_DATASET) ? process.env.NEXT_PUBLIC_SANITY_DATASET.trim() : "production",
  apiVersion: isConfiguredValue(process.env.SANITY_API_VERSION) ? process.env.SANITY_API_VERSION.trim() : "2025-01-01",
  useCdn: process.env.NODE_ENV === "production" && !readToken,
  token: readToken,
  perspective: "published",
}) : null;

export function requireSanityClient() {
  if (!sanityClient) throw new Error("Sanity is not configured.");
  return sanityClient;
}

export const projectsQuery = `*[_type == "project" && defined(slug.current)] | order(featured desc, publishedAt desc) {
  _id, title, "slug": slug.current, location, region, assetClass, priceRangeINR, status,
  reraNumber, description, featured, "heroImage": heroImage.asset->url,
  "floorPlans": floorPlans[]{direction, bhkType, sqft, "imageUrl": image.asset->url}
}`;
