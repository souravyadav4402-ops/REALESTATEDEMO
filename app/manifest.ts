import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Parcel & Form India",
    short_name: "P/F India",
    description: "Digital experiences for landmark Indian real estate.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f8f6",
    theme_color: "#1a1a18",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
