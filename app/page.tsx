import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { projects } from "@/data/projects";
import { pageMetadata } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata("home");

const metrics = [
  ["₹4,500 Cr+", "Illustrative portfolio value digitized"],
  ["98%", "Target NRI engagement elevation"],
  ["Zero-friction", "Conversion systems across every time zone"],
];

export default function HomePage() {
  return (
    <>
      <PageHero eyebrow="INDEPENDENT DIGITAL STUDIO · LUXURY REAL ESTATE" title={<>Turning Indian Square Feet into <em>Global Objects of Desire.</em></>} description="Bespoke digital platforms, interactive 3D twins, and brand stories for luxury residences, heritage estates, and landmark developments across South Mumbai, Goa, Gurgaon, and Bengaluru." image="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2200&q=90" imageAlt="Mumbai skyline and sea at golden hour" index="01 / 06">
        <Link className="button button--light" href="/work">Explore portfolio <span>+</span></Link><Link className="line-link line-link--light" href="/contact">Start a project <span>+</span></Link>
      </PageHero>

      <section className="proof-rail" aria-label="Illustrative studio impact metrics"><div className="shell">{metrics.map(([value,label]) => <div key={value}><strong>{value}</strong><span>{label}</span></div>)}</div><p className="shell">Demonstration metrics for positioning only; not audited client outcomes.</p></section>

      <section className="section shell intro-split">
        <p className="eyebrow">01 / SELECTED CONCEPTS</p>
        <Reveal className="intro-split__copy"><h2 className="heading-xl">India’s landmark properties deserve a <em>global digital address.</em></h2><p className="lede">We unite architectural sensitivity, technology and conversion intelligence to make complex property propositions feel inevitable.</p></Reveal>
      </section>

      <section className="featured-work shell" aria-label="Selected portfolio concepts">{projects.slice(0,3).map((project,index) => <Reveal key={project.id} delay={index*80}><ProjectCard project={project} priority={index===0} /></Reveal>)}<Link className="line-link" href="/work">View all concepts <span>+</span></Link></section>

      <section className="philosophy-band section"><div className="shell"><p className="eyebrow eyebrow--light">THE PHILOSOPHY</p><Reveal><blockquote>“In Indian real estate, buyers don’t invest in concrete—they invest in <em>legacy, prestige,</em> and seamless living.”</blockquote></Reveal><div className="philosophy-band__foot"><span>Global fluency</span><span>Indian intelligence</span><span>Commercial clarity</span></div></div></section>

      <section className="section shell capabilities-teaser"><div><p className="eyebrow">02 / CAPABILITIES</p><h2 className="heading-xl">One connected<br/><em>sales engine.</em></h2></div><div className="capability-links">{["Strategy & Positioning","CGI & Virtual Architecture","Digital Experience","NRI Capital Conversion"].map((item,index)=><Link href="/services" key={item}><small>0{index+1}</small><span>{item}</span><b>+</b></Link>)}</div></section>
    </>
  );
}
