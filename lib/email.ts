import sgMail from "@sendgrid/mail";
import type { InquiryInput } from "@/lib/inquiry-schema";
import { configuredValue, hasConfiguredValues } from "@/lib/env";
import { ProviderDeliveryError, uncertainProviderFailure } from "@/lib/provider-errors";

export function isEmailConfigured() {
  return hasConfiguredValues("SENDGRID_API_KEY", "INQUIRY_NOTIFICATION_EMAIL", "SENDGRID_FROM_EMAIL");
}

export async function notifyStudio(input: InquiryInput, inquiryId: string, requestId: string): Promise<string> {
  if (!isEmailConfigured()) throw new ProviderDeliveryError("SendGridNotConfigured");
  sgMail.setApiKey(configuredValue("SENDGRID_API_KEY"));
  try {
    const [response] = await sgMail.send({
      to: configuredValue("INQUIRY_NOTIFICATION_EMAIL"),
      from: configuredValue("SENDGRID_FROM_EMAIL"),
      replyTo: input.email,
      subject: `[${input.budgetCategory}] ${input.propertyType} inquiry · ${input.locationFocus}`,
      text: [`Inquiry: ${inquiryId}`, `Delivery: ${requestId}`, `Name: ${input.name}`, `Email: ${input.email}`, `Phone: ${input.countryCode}${input.phone}`, `NRI: ${input.nriStatus ? "Yes" : "No"}`, `GDV: ₹${input.budgetCrores} Cr`, `Timeline: ${input.projectTimeline}`, `Project: ${input.projectOfInterest || "Not supplied"}`].join("\n"),
      customArgs: { delivery_id: requestId },
    });
    const rawId = response.headers["x-message-id"];
    return Array.isArray(rawId) ? rawId[0] ?? requestId : rawId ? String(rawId) : requestId;
  } catch (error) {
    const status = (error as { code?: number; response?: { statusCode?: number } })?.response?.statusCode ?? (error as { code?: number })?.code;
    if (typeof status === "number") throw new ProviderDeliveryError(`SendGridHttp${status}`);
    throw uncertainProviderFailure("SendGrid", error);
  }
}
