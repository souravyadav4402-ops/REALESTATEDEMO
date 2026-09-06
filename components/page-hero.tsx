import Image from "next/image";
import { type ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  image: string;
  imageAlt: string;
  index: string;
  children?: ReactNode;
  compact?: boolean;
}

export function PageHero({ eyebrow, title, description, image, imageAlt, index, children, compact = false }: PageHeroProps) {
  return (
    <section className={`page-hero${compact ? " page-hero--compact" : ""}`}>
      <div className="page-hero__media"><Image src={image} alt={imageAlt} fill priority sizes="100vw" /></div>
      <div className="page-hero__shade" />
      <div className="page-hero__content shell">
        <p className="eyebrow eyebrow--light">{eyebrow}</p>
        <h1 className="display">{title}</h1>
        <div className="page-hero__lower"><p>{description}</p><span>{index}</span></div>
        {children && <div className="page-hero__actions">{children}</div>}
      </div>
    </section>
  );
}
