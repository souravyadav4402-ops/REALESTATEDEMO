import { createHash } from "node:crypto";
import { DeliveryStatus, IntegrationProvider, LeadStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { hasConfiguredValues } from "@/lib/env";
import { isEmailConfigured } from "@/lib/email";
import { inquirySchema } from "@/lib/inquiry-schema";
import { isLeadSquaredConfigured } from "@/lib/leadsquared";
import { prisma } from "@/lib/prisma";
import { privacyDeploymentReady } from "@/lib/privacy-server";
import { enforceInquiryRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class PayloadTooLargeError extends Error {}

function allowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const configured = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  return origin === request.nextUrl.origin || configured.includes(origin) ? origin : false;
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Request-ID, Idempotency-Key",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
}

function trustedClientIdentifier(request: NextRequest) {
  const configuredHeader = process.env.TRUSTED_PROXY_IP_HEADER?.toLowerCase();
  const allowedHeaders = new Set(["cf-connecting-ip", "true-client-ip", "x-real-ip", "x-forwarded-for"]);
  let value: string | null = null;

  if (process.env.VERCEL) value = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? null;
  else if (configuredHeader && allowedHeaders.has(configuredHeader)) {
    const raw = request.headers.get(configuredHeader);
    value = configuredHeader === "x-forwarded-for" ? raw?.split(",").at(-1)?.trim() ?? null : raw?.trim() ?? null;
  } else if (process.env.NODE_ENV !== "production") {
    value = request.headers.get("x-real-ip") ?? "local-development";
  }

  return value?.slice(0, 100) ?? null;
}

async function readBoundedJson(request: NextRequest, maxBytes = 16_384): Promise<unknown> {
  if (!request.body) throw new SyntaxError("Missing request body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { await reader.cancel(); throw new PayloadTooLargeError(); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function OPTIONS(request: NextRequest) {
  const origin = allowedOrigin(request);
  if (origin === false) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id")?.slice(0, 80) || crypto.randomUUID();
  const origin = allowedOrigin(request);
  if (origin === false) return NextResponse.json({ success: false, message: "Origin not allowed." }, { status: 403, headers: corsHeaders(null) });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) return NextResponse.json({ success: false, message: "Request is too large." }, { status: 413, headers: corsHeaders(origin) });

  const clientId = trustedClientIdentifier(request);
  if (!clientId) return NextResponse.json({ success: false, message: "Inquiry service is temporarily unavailable." }, { status: 503, headers: corsHeaders(origin) });

  const rate = await enforceInquiryRateLimit(clientId);
  const rateHeaders = { "X-RateLimit-Limit": String(rate.limit), "X-RateLimit-Remaining": String(rate.remaining), "X-RateLimit-Reset": String(rate.reset) };
  if (rate.configurationError) return NextResponse.json({ success: false, message: "Inquiry service is temporarily unavailable." }, { status: 503, headers: { ...corsHeaders(origin), ...rateHeaders } });
  if (!rate.success) return NextResponse.json({ success: false, message: "Please wait before sending another inquiry." }, { status: 429, headers: { ...corsHeaders(origin), ...rateHeaders, "Retry-After": String(Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000))) } });

  let raw: unknown;
  try { raw = await readBoundedJson(request); }
  catch (error) {
    const status = error instanceof PayloadTooLargeError ? 413 : 400;
    return NextResponse.json({ success: false, message: status === 413 ? "Request is too large." : "Invalid JSON request." }, { status, headers: { ...corsHeaders(origin), ...rateHeaders } });
  }

  if (typeof raw === "object" && raw !== null && "companyWebsite" in raw && Boolean((raw as { companyWebsite?: unknown }).companyWebsite)) {
    return NextResponse.json({ success: true, message: "Inquiry received." }, { status: 201, headers: { ...corsHeaders(origin), ...rateHeaders } });
  }

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ success: false, message: "Please review the highlighted information.", fields: parsed.error.flatten().fieldErrors }, { status: 422, headers: { ...corsHeaders(origin), ...rateHeaders } });

  const input = parsed.data;
  const databaseConfigured = hasConfiguredValues("DATABASE_URL");
  const crmQueued = isLeadSquaredConfigured();
  const emailQueued = isEmailConfigured();
  if (process.env.NODE_ENV === "production" && (!databaseConfigured || !hasConfiguredValues("CRON_SECRET") || (!crmQueued && !emailQueued) || !privacyDeploymentReady())) {
    return NextResponse.json({ success: false, message: "Inquiry service is temporarily unavailable." }, { status: 503, headers: { ...corsHeaders(origin), ...rateHeaders } });
  }

  const suppliedKey = request.headers.get("idempotency-key")?.trim();
  if (suppliedKey && !/^[A-Za-z0-9_-]{16,128}$/.test(suppliedKey)) {
    return NextResponse.json({ success: false, message: "Invalid Idempotency-Key header." }, { status: 422, headers: { ...corsHeaders(origin), ...rateHeaders } });
  }
  const idempotencyKey = suppliedKey || crypto.randomUUID();
  const requestFingerprint = createHash("sha256").update(JSON.stringify(input)).digest("hex");

  try {
    if (!databaseConfigured) {
      return NextResponse.json({ success: true, inquiryId: crypto.randomUUID(), message: "Your private inquiry has been received.", mode: "development-demo" }, { status: 201, headers: { ...corsHeaders(origin), ...rateHeaders, "X-Request-ID": requestId } });
    }

    const lead = await prisma.$transaction(async (transaction) => {
      const created = await transaction.lead.create({ data: {
        idempotencyKey,
        requestFingerprint,
        name: input.name,
        email: input.email,
        phone: input.phone,
        countryCode: input.countryCode,
        nriStatus: input.nriStatus,
        propertyType: input.propertyType,
        budgetCategory: input.budgetCategory,
        budgetCrores: input.budgetCrores,
        locationFocus: input.locationFocus,
        projectOfInterest: input.projectOfInterest || null,
        projectTimeline: input.projectTimeline,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        status: crmQueued || emailQueued ? LeadStatus.QUEUED : LeadStatus.COMPLETE,
        crmStatus: crmQueued ? DeliveryStatus.PENDING : DeliveryStatus.NOT_CONFIGURED,
        emailStatus: emailQueued ? DeliveryStatus.PENDING : DeliveryStatus.NOT_CONFIGURED,
        consentAt: new Date(),
        privacyNoticeVersion: input.privacyNoticeVersion,
      } });
      const providers = [
        ...(crmQueued ? [IntegrationProvider.LEADSQUARED] : []),
        ...(emailQueued ? [IntegrationProvider.SENDGRID] : []),
      ];
      if (providers.length) await transaction.integrationOutbox.createMany({ data: providers.map((provider) => ({ leadId: created.id, provider })) });
      return created;
    });

    return NextResponse.json({ success: true, inquiryId: lead.id, message: "Your private inquiry has been received." }, { status: 201, headers: { ...corsHeaders(origin), ...rateHeaders, "X-Request-ID": requestId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = databaseConfigured ? await prisma.lead.findUnique({ where: { idempotencyKey }, select: { id: true, requestFingerprint: true } }) : null;
      if (existing?.requestFingerprint === requestFingerprint) return NextResponse.json({ success: true, inquiryId: existing.id, message: "Your private inquiry has already been received." }, { status: 200, headers: { ...corsHeaders(origin), ...rateHeaders, "X-Request-ID": requestId } });
      return NextResponse.json({ success: false, message: "This request key was already used for different information." }, { status: 409, headers: { ...corsHeaders(origin), ...rateHeaders, "X-Request-ID": requestId } });
    }
    console.error(JSON.stringify({ level: "error", event: "inquiry_failed", requestId, error: error instanceof Error ? error.name : "UnknownError" }));
    return NextResponse.json({ success: false, message: "We could not submit your inquiry. Please try again or contact the studio directly." }, { status: 500, headers: { ...corsHeaders(origin), ...rateHeaders, "X-Request-ID": requestId } });
  }
}
