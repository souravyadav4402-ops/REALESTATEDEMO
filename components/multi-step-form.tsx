"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy";

type PropertyType = "Luxury Residential" | "Commercial" | "Boutique Villas" | "Real Estate Agency";
type Budget = "< ₹50 Cr" | "₹50 Cr – ₹250 Cr" | "₹250 Cr+";
type Location = "Mumbai" | "Delhi NCR" | "Bengaluru" | "Goa" | "International";

interface InquiryState {
  propertyType?: PropertyType;
  budgetCategory?: Budget;
  budgetCrores: number;
  locationFocus?: Location;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  nriStatus: boolean;
  projectTimeline: string;
  projectOfInterest: string;
  consent: boolean;
  privacyNoticeVersion: typeof PRIVACY_NOTICE_VERSION;
  companyWebsite: string;
}

const initialState: InquiryState = { budgetCrores: 120, name: "", email: "", countryCode: "+91", phone: "", nriStatus: false, projectTimeline: "Q3/Q4 2026", projectOfInterest: "", consent: false, privacyNoticeVersion: PRIVACY_NOTICE_VERSION, companyWebsite: "" };
const propertyTypes: PropertyType[] = ["Luxury Residential", "Commercial", "Boutique Villas", "Real Estate Agency"];
const budgets: Budget[] = ["< ₹50 Cr", "₹50 Cr – ₹250 Cr", "₹250 Cr+"];
const locations: Location[] = ["Mumbai", "Delhi NCR", "Bengaluru", "Goa", "International"];
const budgetDefaults: Record<Budget, number> = { "< ₹50 Cr": 30, "₹50 Cr – ₹250 Cr": 120, "₹250 Cr+": 300 };

function categoryForBudget(crores: number): Budget {
  return crores < 50 ? "< ₹50 Cr" : crores <= 250 ? "₹50 Cr – ₹250 Cr" : "₹250 Cr+";
}

export function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<InquiryState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [advancing, setAdvancing] = useState(false);
  const transitionTimer = useRef<number | null>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const idempotencyKey = useRef("");
  const progress = ((step + 1) / 4) * 100;

  useEffect(() => () => { if (transitionTimer.current) window.clearTimeout(transitionTimer.current); }, []);
  useEffect(() => { stepRef.current?.querySelector<HTMLElement>("legend")?.focus(); }, [step]);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(data.propertyType);
    if (step === 1) return Boolean(data.budgetCategory) && data.budgetCategory === categoryForBudget(data.budgetCrores);
    if (step === 2) return Boolean(data.locationFocus);
    return data.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(data.email) && data.phone.replace(/\D/g, "").length >= 7 && data.consent;
  }, [data, step]);

  const update = <K extends keyof InquiryState>(key: K, value: InquiryState[K]) => setData((current) => ({ ...current, [key]: value }));
  const chooseAndAdvance = <K extends keyof InquiryState>(key: K, value: InquiryState[K], targetStep: number) => {
    if (advancing) return;
    update(key, value);
    setAdvancing(true);
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => { setStep(targetStep); setAdvancing(false); }, 180);
  };
  const selectBudget = (budget: Budget) => setData((current) => ({ ...current, budgetCategory: budget, budgetCrores: budgetDefaults[budget] }));
  const changeBudget = (crores: number) => setData((current) => ({ ...current, budgetCrores: crores, budgetCategory: categoryForBudget(crores) }));
  const goBack = () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setAdvancing(false);
    setStep((current) => Math.max(0, current - 1));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canContinue || status === "submitting") return;
    setStatus("submitting"); setMessage("");
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/inquire", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey.current }, body: JSON.stringify({ ...data, utmSource: new URLSearchParams(window.location.search).get("utm_source") ?? "direct" }) });
      const result = (await response.json()) as { success?: boolean; message?: string; inquiryId?: string };
      if (!response.ok || !result.success) throw new Error(result.message ?? "We could not submit your inquiry.");
      setStatus("success"); setMessage(`Your private inquiry is logged${result.inquiryId ? ` · ${result.inquiryId.slice(0, 8)}` : ""}. Our studio will respond within one business day.`);
    } catch (error) {
      setStatus("error"); setMessage(error instanceof Error ? error.message : "Something went wrong. Please contact the studio directly.");
    }
  }

  const reset = () => { setData(initialState); setStep(0); setStatus("idle"); idempotencyKey.current = ""; };
  if (status === "success") return <div className="form-success" role="status"><span>✓</span><p className="eyebrow">INQUIRY RECEIVED</p><h2>Thank you, {data.name.split(" ")[0]}.</h2><p>{message}</p><button type="button" className="line-link" onClick={reset}>Start another inquiry <span>+</span></button></div>;

  return (
    <form className="inquiry-form" onSubmit={submit} noValidate>
      <div className="form-progress"><span style={{ width: `${progress}%` }} /><p aria-live="polite">STEP 0{step + 1} / 04</p></div>
      <div ref={stepRef} className="form-step" key={step}>
        {step === 0 && <fieldset><legend tabIndex={-1}>What type of property are you building or selling?</legend><p>Select the closest fit. We will refine the brief together.</p><div className="option-grid">{propertyTypes.map((item) => <button type="button" disabled={advancing} key={item} aria-pressed={data.propertyType === item} onClick={() => chooseAndAdvance("propertyType", item, 1)}><small>0{propertyTypes.indexOf(item) + 1}</small>{item}<span>+</span></button>)}</div></fieldset>}
        {step === 1 && <fieldset><legend tabIndex={-1}>What is the target project value / GDV?</legend><p>This helps us recommend an appropriate digital scope.</p><div className="option-grid option-grid--three">{budgets.map((item) => <button type="button" key={item} aria-pressed={data.budgetCategory === item} onClick={() => selectBudget(item)}><small>0{budgets.indexOf(item) + 1}</small>{item}<span>+</span></button>)}</div><div className="budget-slider"><label htmlFor="budget">Indicative GDV <strong>₹{data.budgetCrores} Crore</strong></label><input id="budget" type="range" min="10" max="500" step="10" value={data.budgetCrores} onChange={(event) => changeBudget(Number(event.target.value))} /><div><span>₹10 Cr</span><span>₹500 Cr+</span></div></div></fieldset>}
        {step === 2 && <fieldset><legend tabIndex={-1}>Where is the project focused?</legend><p>Choose the primary market. International projects are welcome.</p><div className="option-grid">{locations.map((item) => <button type="button" disabled={advancing} key={item} aria-pressed={data.locationFocus === item} onClick={() => chooseAndAdvance("locationFocus", item, 3)}><small>0{locations.indexOf(item) + 1}</small>{item}<span>+</span></button>)}</div></fieldset>}
        {step === 3 && <fieldset><legend tabIndex={-1}>Who should we speak with?</legend><p>Your details remain private and are used only to respond to this inquiry.</p><div className="input-grid"><label><span>Name</span><input autoComplete="name" value={data.name} onChange={(event) => update("name", event.target.value)} required /></label><label><span>Work email</span><input type="email" autoComplete="email" value={data.email} onChange={(event) => update("email", event.target.value)} required /></label><label className="phone-field"><span>Phone / WhatsApp</span><div><select aria-label="Country code" value={data.countryCode} onChange={(event) => update("countryCode", event.target.value)}><option>+91</option><option>+971</option><option>+44</option><option>+1</option><option>+65</option></select><input type="tel" autoComplete="tel-national" value={data.phone} onChange={(event) => update("phone", event.target.value)} required /></div></label><label><span>Preferred timeline</span><select value={data.projectTimeline} onChange={(event) => update("projectTimeline", event.target.value)}><option>Immediately</option><option>Q3/Q4 2026</option><option>Within 6 months</option><option>Exploratory</option></select></label><label className="input-wide"><span>Project / development name (optional)</span><input value={data.projectOfInterest} onChange={(event) => update("projectOfInterest", event.target.value)} /></label></div><label className="check"><input type="checkbox" checked={data.nriStatus} onChange={(event) => update("nriStatus", event.target.checked)} /><span>I am based outside India / this project targets NRI buyers.</span></label><label className="check"><input type="checkbox" checked={data.consent} onChange={(event) => update("consent", event.target.checked)} required /><span>I consent to being contacted about this inquiry and accept the <Link href="#privacy-notice">privacy notice</Link>.</span></label><label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={data.companyWebsite} onChange={(event) => update("companyWebsite", event.target.value)} /></label></fieldset>}
      </div>
      <div className="form-controls">{step > 0 ? <button type="button" className="form-back" onClick={goBack}>← Back</button> : <span />}{step < 3 ? <button type="button" className="button button--brass" disabled={!canContinue || advancing} onClick={() => setStep((current) => Math.min(3, current + 1))}>Continue <span>+</span></button> : <button type="submit" className="button button--brass" disabled={!canContinue || status === "submitting"}>{status === "submitting" ? "Sending…" : "Send private inquiry"} <span>+</span></button>}</div>
      {status === "error" && <p className="form-error" role="alert">{message}</p>}
    </form>
  );
}
