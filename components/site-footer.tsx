import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { RERAFooterModal } from "@/components/rera-footer-modal";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__cta shell">
        <p className="eyebrow eyebrow--light">PRIVATE CONSULTATIONS · Q3/Q4</p>
        <h2>Let’s shape your<br/><em>next landmark.</em></h2>
        <Link className="line-link line-link--light" href="/contact">Start a project <span>+</span></Link>
      </div>
      <div className="site-footer__bar shell">
        <BrandMark inverse />
        <div className="site-footer__locations">{siteConfig.brand.locations.map((location) => <span key={location}>{location}</span>)}</div>
        <div className="site-footer__legal"><RERAFooterModal /><span>© {new Date().getFullYear()} P/F INDIA</span></div>
      </div>
    </footer>
  );
}
