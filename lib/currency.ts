export type SupportedCurrency = "INR" | "USD" | "AED";
interface ExchangeRates { USD: number; AED: number; asOf: string; source: string; }

function positiveRate(value: unknown, label: string) {
  const rate = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`${label} must be a finite positive exchange rate.`);
  return rate;
}

async function getRates(): Promise<ExchangeRates> {
  const endpoint = process.env.EXCHANGE_RATE_API_URL ?? "https://api.frankfurter.app/latest?from=INR&to=USD,AED";
  try {
    const response = await fetch(endpoint, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4_000) });
    if (!response.ok) throw new Error(`Rate provider returned ${response.status}`);
    const data = await response.json() as { rates?: { USD?: number; AED?: number }; date?: string };
    return { USD: positiveRate(data.rates?.USD, "USD rate"), AED: positiveRate(data.rates?.AED, "AED rate"), asOf: data.date ?? new Date().toISOString(), source: "exchange-rate-api" };
  } catch (providerError) {
    try {
      return {
        USD: positiveRate(process.env.FALLBACK_INR_USD_RATE ?? 0.0115, "Fallback USD rate"),
        AED: positiveRate(process.env.FALLBACK_INR_AED_RATE ?? 0.0422, "Fallback AED rate"),
        asOf: new Date().toISOString(),
        source: "configured-fallback",
      };
    } catch (fallbackError) {
      throw new AggregateError([providerError, fallbackError], "No valid exchange rates are available.");
    }
  }
}

export async function convertCrores(crores: number) {
  if (!Number.isFinite(crores) || crores < 0) throw new RangeError("Crores must be a non-negative finite number.");
  const rates = await getRates();
  const inr = crores * 10_000_000;
  return {
    INR: { value: inr, formatted: `₹${crores.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr` },
    USD: { value: inr * rates.USD, formatted: `$${((inr * rates.USD) / 1_000_000).toFixed(2)} M` },
    AED: { value: inr * rates.AED, formatted: `AED ${((inr * rates.AED) / 1_000_000).toFixed(2)} M` },
    meta: { asOf: rates.asOf, source: rates.source, indicativeOnly: true },
  };
}
