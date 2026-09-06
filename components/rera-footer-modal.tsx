"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function RERAFooterModal() {
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const root = document.createElement("div");
    root.dataset.modalPortal = "rera-disclosures";
    document.body.appendChild(root);
    setPortalRoot(root);
    return () => root.remove();
  }, []);

  useEffect(() => {
    if (!open || !portalRoot) return;

    const background = Array.from(document.body.children).filter((element) => element !== portalRoot) as HTMLElement[];
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousStates = background.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));

    document.body.style.overflow = "hidden";
    previousStates.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousStates.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      window.setTimeout(() => trigger?.focus(), 0);
    };
  }, [closeModal, open, portalRoot]);

  const modal = open && portalRoot ? createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <section ref={dialogRef} className="rera-modal" role="dialog" aria-modal="true" aria-labelledby="rera-title" aria-describedby="rera-description">
        <button ref={closeRef} className="modal-close" type="button" aria-label="Close disclosures" onClick={closeModal}>×</button>
        <p className="eyebrow">LEGAL / DEMONSTRATION</p>
        <h2 id="rera-title">RERA &amp; portfolio disclosures</h2>
        <div id="rera-description">
          <p>This website is a creative demonstration for a digital studio. Project names, values, outcomes, RERA numbers and performance figures shown in concept case studies are illustrative and do not represent active property listings or completed client engagements.</p>
          <p>Production implementations must display the applicable state RERA registration number, sanctioned plans, approvals, promoter details and statutory disclaimer supplied by the developer on every relevant project route.</p>
          <p>Currency conversions are indicative only. Buyers should rely on final legal documents, registered agreements and professional advice.</p>
        </div>
      </section>
    </div>,
    portalRoot,
  ) : null;

  return (
    <>
      <button ref={triggerRef} className="footer-disclosure" type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>RERA &amp; concept disclosures</button>
      {modal}
    </>
  );
}
