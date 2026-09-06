import { z } from "zod";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy";

const cleanText = (maximum: number) => z.string().trim().min(1).max(maximum).transform((value) => value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim());
const normalizedPhone = z.preprocess((value) => typeof value === "string" ? value.replace(/\D/g, "") : value, z.string().regex(/^\d{7,15}$/));

export const inquirySchema = z.object({
  propertyType: z.enum(["Luxury Residential", "Commercial", "Boutique Villas", "Real Estate Agency"]),
  budgetCategory: z.enum(["< ₹50 Cr", "₹50 Cr – ₹250 Cr", "₹250 Cr+"]),
  budgetCrores: z.number().int().min(10).max(500),
  locationFocus: z.enum(["Mumbai", "Delhi NCR", "Bengaluru", "Goa", "International"]),
  name: cleanText(100).refine((value) => value.length >= 2, "Please enter your name."),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  countryCode: z.string().trim().regex(/^\+[1-9]\d{0,3}$/),
  phone: normalizedPhone,
  nriStatus: z.boolean(),
  projectTimeline: cleanText(60),
  projectOfInterest: z.string().trim().max(150).transform((value) => value.replace(/[\u0000-\u001F\u007F]/g, " ").trim()).optional().default(""),
  consent: z.literal(true),
  privacyNoticeVersion: z.literal(PRIVACY_NOTICE_VERSION),
  companyWebsite: z.string().max(0).optional().default(""),
  utmSource: z.string().trim().max(100).optional().default("direct"),
  utmMedium: z.string().trim().max(100).optional(),
  utmCampaign: z.string().trim().max(100).optional(),
}).strict().superRefine((value, context) => {
  const budgetMatches = value.budgetCategory === "< ₹50 Cr" ? value.budgetCrores < 50 : value.budgetCategory === "₹50 Cr – ₹250 Cr" ? value.budgetCrores >= 50 && value.budgetCrores <= 250 : value.budgetCrores > 250;
  if (!budgetMatches) context.addIssue({ code: z.ZodIssueCode.custom, path: ["budgetCategory"], message: "Budget category must match the indicative GDV." });
  const combinedDigits = `${value.countryCode}${value.phone}`.replace(/\D/g, "");
  if (combinedDigits.length < 8 || combinedDigits.length > 15) context.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Enter a valid international phone number." });
});

export type InquiryInput = z.infer<typeof inquirySchema>;
