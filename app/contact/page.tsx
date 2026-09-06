import type { Metadata } from "next";
import { MultiStepForm } from "@/components/multi-step-form";
import { PageHero } from "@/components/page-hero";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy";
import { privacyController } from "@/lib/privacy-server";
import { pageMetadata, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata("contact");

export default function ContactPage() {
  const controller = privacyController();
  return (
    <>
      <PageHero compact eyebrow="PRIVATE INQUIRY" title={<>Let’s Shape Your<br/><em>Next Landmark.</em></>} description="Currently accepting select development and studio branding projects for Q3/Q4. Begin with four focused questions; no generic brief required." image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=90" imageAlt="Refined private meeting room with warm natural light" index="06 / 06" />
      <section className="contact-workspace section">
        <div className="shell">
          <aside>
            <p className="eyebrow">DIRECT STUDIO ACCESS</p>
            <h2 className="heading-lg">A considered first conversation.</h2>
            <p>Qualified inquiries are routed to the appropriate senior studio lead, not a generic sales queue.</p>
            <dl>
              <div><dt>Studio</dt><dd>{siteConfig.brand.locations.join(" · ")}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${controller.contactEmail}`}>{controller.contactEmail}</a></dd></div>
              <div><dt>Phone</dt><dd>{controller.phone}</dd></div>
              <div><dt>WhatsApp</dt><dd><a href={controller.whatsappUrl} target="_blank" rel="noreferrer">Private concierge +</a></dd></div>
              <div><dt>Response</dt><dd>Within one business day</dd></div>
            </dl>
            <p className="contact-privacy">Your information is used only to evaluate and respond to your inquiry. Review the notice below before submitting.</p>
          </aside>
          <MultiStepForm />
        </div>
      </section>
      <section id="privacy-notice" className="privacy-notice section" aria-labelledby="privacy-notice-title">
        <div className="shell privacy-notice__grid">
          <div>
            <p className="eyebrow">INQUIRY DATA</p>
            <h2 id="privacy-notice-title" className="heading-lg">Privacy notice.</h2>
            {controller.isDemo && <p className="privacy-notice__demo">Demonstration notice only. Production inquiry intake remains disabled until the deploying controller supplies verified identity and contact settings.</p>}
            <p className="privacy-notice__version">Version {PRIVACY_NOTICE_VERSION} · effective 6 September 2026</p>
          </div>
          <div className="privacy-notice__copy">
            <article><h3>Who controls your information</h3><p>{controller.controllerName} is the controller for inquiry information submitted through this {controller.isDemo ? "demonstration" : "website"}. Privacy questions, access requests and withdrawal requests can be sent to <a href={`mailto:${controller.contactEmail}`}>{controller.contactEmail}</a>.</p></article>
            <article><h3>What we collect and why</h3><p>We collect your name, work email, phone number, location, NRI status, project profile, indicative value, timeline, consent record and campaign attribution. We use it to evaluate your request, respond, route it to a relevant studio lead and maintain a record of the conversation.</p></article>
            <article><h3>Contact channels and processors</h3><p>With your consent, we may respond by email, phone or WhatsApp. Production deployments can process inquiry data through PostgreSQL hosting, LeadSquared, Meta WhatsApp and SendGrid, including transfers outside India where those providers operate. Appropriate contracts and transfer safeguards must be configured by the deploying controller.</p></article>
            <article><h3>Retention and your choices</h3><p>Inquiry records should be retained for no longer than 12 months after the last meaningful contact unless a contract, legal obligation or active request requires longer retention. You may ask for access, correction or deletion, object to processing, or withdraw contact consent at any time by emailing the address above. Withdrawal does not affect processing already completed.</p></article>
          </div>
        </div>
      </section>
    </>
  );
}
