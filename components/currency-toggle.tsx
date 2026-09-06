"use client";

import { useEffect, useState } from "react";

type Currency = "INR" | "USD" | "AED";
interface CurrencyResponse {
  success: boolean;
  prices?: Record<Currency, { formatted: string }> & { meta: { source: string; asOf: string } };
}

function fallbackPrices(crores: number): Record<Currency, string> {
  return {
    INR: `₹${crores.toLocaleString("en-IN")} Cr`,
    USD: `$${(crores * 10 * 0.0115).toFixed(2)} M`,
    AED: `AED ${(crores * 10 * 0.0422).toFixed(2)} M`,
  };
}

export function CurrencyToggle({ crores = 25 }: { crores?: number }) {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [prices, setPrices] = useState<Record<Currency, string>>(() => fallbackPrices(crores));
  const [source, setSource] = useState("loading cached rates");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/currency?crores=${encodeURIComponent(crores)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<CurrencyResponse> : Promise.reject(new Error("Currency request failed")))
      .then((result) => {
        if (!result.success || !result.prices) return;
        setPrices({ INR: result.prices.INR.formatted, USD: result.prices.USD.formatted, AED: result.prices.AED.formatted });
        setSource(result.prices.meta.source === "exchange-rate-api" ? "hourly cached market rates" : "configured indicative rates");
      })
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setSource("indicative fallback rates"); });
    return () => controller.abort();
  }, [crores]);

  return (
    <div className="currency-demo">
      <div className="currency-toggle" role="group" aria-label="Display currency">
        {(["INR", "USD", "AED"] as const).map((item) => <button type="button" key={item} aria-pressed={currency === item} className={currency === item ? "is-active" : ""} onClick={() => setCurrency(item)}>{item === "INR" ? "₹ Crores" : item === "USD" ? "$ Millions" : "AED Millions"}</button>)}
      </div>
      <strong aria-live="polite">{prices[currency]}</strong>
      <small>Indicative conversion · {source}</small>
    </div>
  );
}
