import Link from "next/link";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className={`brand-mark${inverse ? " brand-mark--inverse" : ""}`} href="/" aria-label="Parcel and Form India home">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M3 16 16 3l13 13-13 13L3 16Z" />
        <path d="M9 16h14M16 9v14" />
      </svg>
      <span>Parcel <i>&amp;</i> Form <small>INDIA</small></span>
    </Link>
  );
}
