export type ProjectRegion = "Goa" | "Mumbai" | "NCR" | "Bengaluru" | "Alibaug";
export type AssetClass = "Residential" | "Commercial" | "Estates";

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  region: ProjectRegion;
  assetClass: AssetClass;
  timeline: string;
  metric: string;
  metricLabel: string;
  image: string;
  alt: string;
  featured?: boolean;
  size?: "standard" | "wide";
  tone: "forest" | "sand" | "charcoal" | "teak" | "stone" | "brass";
  reraNote: string;
}

export const projects: Project[] = [
  {
    id: "the-canopy",
    title: "The Canopy",
    subtitle: "Biophilic eco-villas composed around coffee forest and rain.",
    location: "Madikeri · Coorg",
    region: "Bengaluru",
    assetClass: "Estates",
    timeline: "Concept · 2026",
    metric: "3.2×",
    metricLabel: "Illustrative qualified session depth",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=90",
    alt: "Contemporary residence integrated with dense tropical landscape",
    featured: true,
    size: "wide",
    tone: "forest",
    reraNote: "Concept demonstration · No active inventory",
  },
  {
    id: "altamount-sky",
    title: "Altamount Sky-Residences",
    subtitle: "An ultra-private digital flagship shaped for family offices and global Indians.",
    location: "Altamount Road · Mumbai",
    region: "Mumbai",
    assetClass: "Residential",
    timeline: "Concept · 2026",
    metric: "₹450 Cr",
    metricLabel: "Illustrative portfolio value",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=90",
    alt: "Modern high-rise tower seen against a clear sky",
    tone: "charcoal",
    reraNote: "Concept demonstration · RERA data required at launch",
  },
  {
    id: "casa-isola",
    title: "Casa de L’Isola",
    subtitle: "Portuguese modernism, private courtyards and a slower North Goa rhythm.",
    location: "Assagao · North Goa",
    region: "Goa",
    assetClass: "Estates",
    timeline: "Concept · 2026",
    metric: "68%",
    metricLabel: "Illustrative NRI inquiry share",
    image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=90",
    alt: "Warm minimalist villa interior with stone walls and garden views",
    tone: "teak",
    reraNote: "Concept demonstration · No active offer for sale",
  },
  {
    id: "alibaug-coastal",
    title: "The Alibaug Coastal Estate",
    subtitle: "Off-plan beachfront estates interpreted through light, season and Vastu.",
    location: "Kihim · Alibaug",
    region: "Alibaug",
    assetClass: "Estates",
    timeline: "Case-study concept · 2026",
    metric: "−40%",
    metricLabel: "Illustrative sales-cycle reduction",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=90",
    alt: "Low-slung contemporary coastal house with reflecting pool",
    featured: true,
    size: "wide",
    tone: "stone",
    reraNote: "Concept demonstration · Metrics are illustrative",
  },
  {
    id: "one-gurgaon",
    title: "One Horizon Atelier",
    subtitle: "A hospitality-led residence platform for founders and global executives.",
    location: "Golf Course Road · Gurgaon",
    region: "NCR",
    assetClass: "Residential",
    timeline: "Concept · 2026",
    metric: "91%",
    metricLabel: "Illustrative virtual-tour completion",
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=90",
    alt: "Refined modern living room with warm stone and dark timber",
    tone: "brass",
    reraNote: "Concept demonstration · RERA data required at launch",
  },
  {
    id: "manyata-exchange",
    title: "The Exchange",
    subtitle: "A human-first commercial district for Bengaluru’s next technology chapter.",
    location: "Hebbal · Bengaluru",
    region: "Bengaluru",
    assetClass: "Commercial",
    timeline: "Concept · 2026",
    metric: "42K",
    metricLabel: "Illustrative monthly investor visits",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=90",
    alt: "Contemporary office interior with expansive windows and planting",
    tone: "sand",
    reraNote: "Concept demonstration · Commercial approvals required",
  },
];
