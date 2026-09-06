export interface Article {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  image: string;
  alt: string;
}

export const articles: Article[] = [
  {
    slug: "web-first-launches",
    category: "Launch Intelligence",
    title: "The New Indian Skyline: How Web-First Launches Are Outperforming Traditional Experience Centers.",
    excerpt: "Why the first high-intent property visit increasingly happens on a phone in Dubai, Singapore or London—not at the sales pavilion.",
    readTime: "8 min",
    date: "12 Aug 2026",
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=90",
    alt: "Abstract geometry of a modern concrete building",
  },
  {
    slug: "global-indian",
    category: "NRI Capital",
    title: "Targeting the Global Indian: Design Principles for High-Converting NRI Portals.",
    excerpt: "Currency clarity, asynchronous trust signals and consultation journeys designed around distance, family and time zones.",
    readTime: "6 min",
    date: "28 Jul 2026",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=90",
    alt: "High-rise city skyline at dusk",
  },
  {
    slug: "vastu-minimalism",
    category: "Design Culture",
    title: "Vastu & Minimalism: Balancing Spatial Traditions in Modern Architectural Websites.",
    excerpt: "How to make orientation, light and spatial harmony legible without turning elegant plans into technical diagrams.",
    readTime: "7 min",
    date: "14 Jun 2026",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90",
    alt: "Minimal residence with natural stone and warm daylight",
  },
  {
    slug: "selling-off-plan-goa",
    category: "3D & CGI",
    title: "Selling Off-Plan Real Estate in Goa: A Case for Interactive 3D Renderings.",
    excerpt: "Making monsoon light, courtyard scale and coastal materiality believable long before the first wall is complete.",
    readTime: "9 min",
    date: "21 May 2026",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=90",
    alt: "Sunlit courtyard of a modern tropical villa",
  },
];
