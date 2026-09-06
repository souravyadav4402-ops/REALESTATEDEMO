import type { Metadata } from "next";
import { CurrencyToggle } from "@/components/currency-toggle";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata("services");

const capabilities = [
  { number:"01", title:"Brand Strategy & Positioning", copy:"Narratives that resonate with HNWIs, Indian family offices, tech founders and the next generation of globally fluent buyers.", deliverables:["Audience & market intelligence","Naming and positioning","Launch narrative systems","Sales-content architecture"] },
  { number:"02", title:"Architectural CGI & Real-Time Walkthroughs", copy:"Photorealistic visualization with natural Indian light, accurate material texture and spatial storytelling that survives scrutiny.", deliverables:["4K stills and film","WebGL digital twins","Sun-path simulation","Vastu plan overlays"] },
  { number:"03", title:"High-Converting Web Platforms", copy:"RERA-conscious information architecture, multi-currency presentation and frictionless lead journeys integrated with the sales floor.", deliverables:["Responsive engineering","CMS and DAM","Salesforce / HubSpot / LeadSquared","Analytics and experimentation"] },
  { number:"04", title:"NRI Investor Experiences", copy:"Private digital sales rooms designed around distance, trust, family decision-making and international time zones.", deliverables:["WhatsApp Business journeys","Timezone-aware consultation","Automated pitch decks","Currency and documentation tools"] },
];

export default function ServicesPage() {
  return <>
    <PageHero compact eyebrow="SERVICES & CAPABILITIES" title={<>From Site Blueprint<br/>to <em>Sold Out.</em></>} description="Strategy, image-making and engineering connected around one outcome: moving discerning property buyers from intrigue to conviction." image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90" imageAlt="Architectural studio with material samples and models" index="03 / 06" />
    <section className="section shell service-matrix"><div className="service-matrix__intro"><p className="eyebrow">THE ENGINE</p><h2 className="heading-lg">Senior thinking.<br/><em>Hands-on execution.</em></h2></div><div>{capabilities.map((capability,index)=><Reveal key={capability.number} delay={index*70}><article className="capability-row"><span>{capability.number}</span><div><h3>{capability.title}</h3><p>{capability.copy}</p></div><ul>{capability.deliverables.map(item=><li key={item}>{item}</li>)}</ul></article></Reveal>)}</div></section>
    <section className="section section--sand"><div className="shell tool-demo"><div><p className="eyebrow">MULTI-MARKET CLARITY</p><h2 className="heading-xl">One price.<br/><em>Every buyer.</em></h2><p className="lede">Production platforms use cached exchange rates, source timestamps and clear indicative-price disclaimers.</p></div><CurrencyToggle crores={25} /></div></section>
    <section className="section shell stack-strip"><p className="eyebrow">INTEGRATION-READY REFERENCE STACK</p><div>{["SANITY CMS · OPTIONAL","NEXT.JS","AWS S3 · OPTIONAL","LEADSQUARED","META WHATSAPP","POSTGRESQL"].map(item=><span key={item}>{item}</span>)}</div></section>
  </>;
}
