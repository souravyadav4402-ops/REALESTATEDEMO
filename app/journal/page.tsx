import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { articles } from "@/data/journal";
import { pageMetadata } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata("journal");

export default function JournalPage(){const [featured,...rest]=articles; if(!featured)return null; return <>
  <PageHero compact eyebrow="INSIGHTS & INTELLIGENCE" title={<>Ideas for India’s<br/><em>Next Skyline.</em></>} description="Research and practical perspectives on property technology, NRI capital, architectural storytelling and digital-first development launches." image="https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?auto=format&fit=crop&w=2200&q=90" imageAlt="Indian city skyline seen through warm atmospheric light" index="05 / 06" />
  <section className="section shell journal-feature"><div className="journal-feature__media"><Image src={featured.image} alt={featured.alt} fill priority sizes="(max-width: 800px) 100vw, 55vw"/></div><article><p className="eyebrow">FEATURED · {featured.category}</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><div><span>{featured.date}</span><span>{featured.readTime} read</span></div><span className="article-note">Editorial demonstration · Article detail coming soon</span></article></section>
  <section className="journal-grid shell">{rest.map((article,index)=><article key={article.slug}><div className="journal-card__media"><Image src={article.image} alt={article.alt} fill sizes="(max-width:800px) 100vw, 33vw"/></div><p className="eyebrow">0{index+2} / {article.category}</p><h2>{article.title}</h2><p>{article.excerpt}</p><footer><span>{article.date}</span><span>{article.readTime} read</span></footer><small>Editorial demonstration</small></article>)}</section>
  <section className="journal-newsletter section--sand"><div className="shell"><div><p className="eyebrow">PRIVATE BRIEFING</p><h2 className="heading-lg">Intelligence, without the noise.</h2></div><form><label htmlFor="newsletter-email">Work email</label><div><input id="newsletter-email" type="email" placeholder="name@company.com" disabled/><button type="button" disabled>Coming soon +</button></div><p>Newsletter signup is intentionally disabled in this demonstration.</p></form></div></section>
</>}
