"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) window.setTimeout(() => toggleRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => closeMenu(), [pathname, closeMenu]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;

    const dialog = dialogRef.current;
    const toggle = toggleRef.current;
    const background = Array.from(document.body.children).filter((element) => element !== dialog && !element.contains(dialog)) as HTMLElement[];
    const previousStates = background.map((element) => ({ element, inert: element.inert, ariaHidden: element.getAttribute("aria-hidden") }));
    previousStates.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const focusable = dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    const focusTimer = window.setTimeout(() => focusable?.[0]?.focus(), 50);
    const media = window.matchMedia("(max-width: 1100px)");
    const onBreakpoint = (event: MediaQueryListEvent) => { if (!event.matches) closeMenu(true); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    media.addEventListener("change", onBreakpoint);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove("menu-open");
      media.removeEventListener("change", onBreakpoint);
      document.removeEventListener("keydown", onKeyDown);
      previousStates.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      if (document.activeElement && dialog?.contains(document.activeElement)) window.setTimeout(() => toggle?.focus(), 0);
    };
  }, [open, closeMenu]);

  const navItems = siteConfig.navigation.filter((item) => !item.featured);

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-menu-open" : ""}`}>
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>
          ))}
        </nav>
        <Link className="header-inquire" href="/contact"><span>+</span> Inquire</Link>
        <button ref={toggleRef} className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}><i /><i /></button>
      </header>
      <div ref={dialogRef} id="mobile-navigation" className={`mobile-navigation${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigation" aria-hidden={!open}>
        <button className="mobile-navigation__close" type="button" onClick={() => closeMenu(true)} aria-label="Close navigation">Close <span aria-hidden="true">×</span></button>
        <nav>
          {siteConfig.navigation.map((item, index) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => closeMenu(true)}><small>0{index + 1}</small>{item.label}<span>+</span></Link>
          ))}
        </nav>
        <div className="mobile-navigation__foot"><span>MUMBAI · BENGALURU · LONDON</span><a href={`mailto:${siteConfig.brand.email}`}>{siteConfig.brand.email}</a></div>
      </div>
    </>
  );
}
