import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata("approach");

const principles = [
  ["01","Subtle Vastu Integration","Directionality, ventilation and spatial harmony appear exactly when useful—never as visual clutter."],
  ["02","Trust through Transparency","RERA certificates, disclosures and construction timelines become elegant components of the experience."],
  ["03","Sensorial Digital Luxury","Editorial type, restrained motion and tactile pacing echo teak, limestone, marble and brushed brass."],
];

export default function ApproachPage(){return <>
  <PageHero compact eyebrow="APPROACH & CULTURE" title={<>International Modernism<br/>Meets <em>Indian Heritage.</em></>} description="A design practice grounded in context: global enough for the NRI buyer, culturally intelligent enough to feel unmistakably at home." image="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=90" imageAlt="Quiet architectural interior combining stone, timber and filtered light" index="04 / 06" />
  <section className="section shell principles"><p className="eyebrow">OUR CORE PRINCIPLES</p><div>{principles.map(([number,title,copy],index)=><Reveal key={number} delay={index*90}><article><span>{number}</span><h2>{title}</h2><p>{copy}</p></article></Reveal>)}</div></section>
  <section className="culture-image"><Image src="https://images.unsplash.com/photo-1600607688960-e095ff83135c?auto=format&fit=crop&w=2200&q=90" alt="Warm stone courtyard with reflective water and tropical planting" fill sizes="100vw"/><div className="culture-image__note"><p className="eyebrow">OUR MEASURE</p><strong>Modern, but never placeless.</strong></div></section>
  <section className="section shell process"><div><p className="eyebrow">FROM AMBITION TO ADDRESS</p><h2 className="heading-xl">A focused<br/><em>twelve-week rhythm.</em></h2></div><ol>{[["WEEK 01—02","Discover","Business, buyers, cultural context and commercial ambition."],["WEEK 03—04","Define","Position, content architecture and a singular visual territory."],["WEEK 05—08","Design","Interface, motion, 3D direction and conversion prototypes."],["WEEK 09—12","Deliver","Engineering, integrations, QA, training and launch intelligence."]].map(([week,title,copy])=><li key={title}><span>{week}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></section>
  <section className="ethos-quote section--dark"><div className="shell"><p className="eyebrow eyebrow--light">THE ETHOS</p><blockquote>We don’t add “Indian-ness” as decoration. We find it in <em>light, proportion, material, ritual</em> and the way families decide.</blockquote></div></section>
</>}
