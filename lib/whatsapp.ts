import type { InquiryInput } from "@/lib/inquiry-schema";
import { configuredValue, hasConfiguredValues, isConfiguredValue } from "@/lib/env";
import { ProviderDeliveryError, uncertainProviderFailure } from "@/lib/provider-errors";

export function isWhatsAppConfigured() {
  return hasConfiguredValues("WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_GRAPH_VERSION", "WHATSAPP_TEMPLATE_NAME");
}

export async function sendInquiryWelcome(input: InquiryInput, brochureUrl: string, requestId: string): Promise<string> {
  if (!isWhatsAppConfigured()) throw new ProviderDeliveryError("WhatsAppNotConfigured");
  const endpoint = `https://graph.facebook.com/${configuredValue("WHATSAPP_GRAPH_VERSION")}/${configuredValue("WHATSAPP_PHONE_NUMBER_ID")}/messages`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${configuredValue("WHATSAPP_ACCESS_TOKEN")}`, "Content-Type": "application/json", "X-Request-ID": requestId },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: `${input.countryCode}${input.phone}`.replace(/\D/g, ""),
        type: "template",
        template: {
          name: configuredValue("WHATSAPP_TEMPLATE_NAME"),
          language: { code: isConfiguredValue(process.env.WHATSAPP_TEMPLATE_LANGUAGE) ? process.env.WHATSAPP_TEMPLATE_LANGUAGE.trim() : "en" },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: input.name.split(" ")[0] ?? input.name },
              { type: "text", text: input.projectOfInterest || input.propertyType },
              { type: "text", text: brochureUrl },
              { type: "text", text: isConfiguredValue(process.env.CALENDAR_BOOKING_URL) ? process.env.CALENDAR_BOOKING_URL.trim() : "https://www.parcelandform.in/contact" },
            ],
          }],
        },
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) throw new ProviderDeliveryError(`WhatsAppHttp${response.status}`);
    const result = await response.json() as { messages?: Array<{ id?: string }> };
    const id = result.messages?.[0]?.id;
    if (!id) throw new ProviderDeliveryError("WhatsAppMissingReference", true);
    return id;
  } catch (error) {
    if (error instanceof ProviderDeliveryError) throw error;
    throw uncertainProviderFailure("WhatsApp", error);
  }
}
