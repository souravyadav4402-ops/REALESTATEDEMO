import type { InquiryInput } from "@/lib/inquiry-schema";
import { configuredValue, hasConfiguredValues } from "@/lib/env";
import { ProviderDeliveryError, uncertainProviderFailure } from "@/lib/provider-errors";

interface LeadSquaredAttribute { Attribute: string; Value: string; }
interface LeadSquaredResponse { Status?: string; Message?: { Id?: string }; ProspectId?: string; }

export function isLeadSquaredConfigured() {
  return hasConfiguredValues("LEADSQUARED_BASE_URL", "LEADSQUARED_ACCESS_KEY", "LEADSQUARED_SECRET_KEY");
}

export function leadTags(input: InquiryInput): string[] {
  const tags = [input.nriStatus ? "NRI" : "DOMESTIC", input.locationFocus.toUpperCase().replace(/\s+/g, "-")];
  if (input.budgetCategory === "₹250 Cr+") tags.push("UHNI-250CR-PLUS", "PREMIUM-DESK");
  else if (input.budgetCategory === "₹50 Cr – ₹250 Cr") tags.push("HNI-50-250CR");
  else tags.push("SUB-50CR");
  if (input.propertyType === "Boutique Villas") tags.push("VILLA-DESK");
  return tags;
}

export function toLeadSquaredPayload(input: InquiryInput): LeadSquaredAttribute[] {
  const [firstName, ...rest] = input.name.split(" ");
  return [
    { Attribute: "FirstName", Value: firstName ?? input.name },
    { Attribute: "LastName", Value: rest.join(" ") },
    { Attribute: "EmailAddress", Value: input.email },
    { Attribute: "Phone", Value: `${input.countryCode}${input.phone}` },
    { Attribute: "Source", Value: input.utmSource || "Website" },
    { Attribute: "mx_Property_Type", Value: input.propertyType },
    { Attribute: "mx_Budget_Category", Value: input.budgetCategory },
    { Attribute: "mx_Indicative_GDV_Crores", Value: String(input.budgetCrores) },
    { Attribute: "mx_Location_Focus", Value: input.locationFocus },
    { Attribute: "mx_NRI_Status", Value: input.nriStatus ? "Yes" : "No" },
    { Attribute: "mx_Project_Timeline", Value: input.projectTimeline },
    { Attribute: "mx_Project_of_Interest", Value: input.projectOfInterest || "General studio inquiry" },
    { Attribute: "mx_Lead_Tags", Value: leadTags(input).join(",") },
  ];
}

export async function captureLead(input: InquiryInput, requestId: string): Promise<string> {
  if (!isLeadSquaredConfigured()) throw new ProviderDeliveryError("LeadSquaredNotConfigured");
  const baseUrl = configuredValue("LEADSQUARED_BASE_URL").replace(/\/$/, "");
  const query = new URLSearchParams({ accessKey: configuredValue("LEADSQUARED_ACCESS_KEY"), secretKey: configuredValue("LEADSQUARED_SECRET_KEY") });
  try {
    const response = await fetch(`${baseUrl}/v2/LeadManagement.svc/Lead.Capture?${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Request-ID": requestId },
      body: JSON.stringify(toLeadSquaredPayload(input)),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) throw new ProviderDeliveryError(`LeadSquaredHttp${response.status}`);
    const result = await response.json() as LeadSquaredResponse;
    const id = result.Message?.Id ?? result.ProspectId;
    if (!id) throw new ProviderDeliveryError("LeadSquaredMissingReference", true);
    return id;
  } catch (error) {
    if (error instanceof ProviderDeliveryError) throw error;
    throw uncertainProviderFailure("LeadSquared", error);
  }
}
