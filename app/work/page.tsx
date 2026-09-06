import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { VastuFloorplanViewer } from "@/components/vastu-floorplan-viewer";
import { WorkFilter } from "@/components/work-filter";
import { pageMetadata } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata("work");

export default function WorkPage() {
  return (
    <>
      <PageHero compact eyebrow="SELECTED WORK · INDIA" title={<>Landmark Residences.<br/><em>Distinctive Digital Addresses.</em></>} description="Art-directed concept studies for Indian developers, private estate creators and property brands addressing buyers at home and across the world." image="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2200&q=90" imageAlt="Geometric facade of a landmark high-rise" index="02 / 06" />
      <section className="section shell"><WorkFilter /></section>
      <section className="case-spotlight section--dark"><div className="shell case-spotlight__head"><p className="eyebrow eyebrow--light">CASE STUDY SPOTLIGHT · CONCEPT</p><h2 className="heading-xl">The Alibaug<br/><em>Coastal Estate.</em></h2><p className="lede lede--light">A speculative experience model for selling ₹25 Cr+ beachfront estates off-plan to overseas investors.</p></div><div className="shell case-columns"><article><span>01 / CHALLENGE</span><p>Communicate architecture, coastal light and long-term value to buyers unable to visit the site.</p></article><article><span>02 / SOLUTION</span><p>A WebGL sun-path simulator, subtle Vastu floor-plan layer and high-frame-stream virtual walkthrough.</p></article><article><span>03 / MODELLED RESULT</span><p>Designed to reduce sales-cycle length by up to 40% while qualifying serious buyers earlier.</p></article></div><div className="shell"><VastuFloorplanViewer /></div></section>
    </>
  );
}
