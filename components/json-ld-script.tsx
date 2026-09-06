import { siteConfig } from "@/lib/site-config";

export function JsonLdScript() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.brand.name,
    url: siteConfig.baseUrl,
    email: siteConfig.brand.email,
    areaServed: ["India", "United Arab Emirates", "United Kingdom", "Singapore"],
    serviceType: ["Real estate digital strategy", "Architectural CGI", "Web engineering", "NRI investor experience"],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
