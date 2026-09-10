import { DeliveryStatus, IntegrationProvider, LeadStatus, OutboxStatus, Prisma, PrivacyRequestStatus } from "@prisma/client";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { configuredValue, hasConfiguredValues } from "@/lib/env";
import { isEmailConfigured, notifyStudio } from "@/lib/email";
import type { InquiryInput } from "@/lib/inquiry-schema";
import { captureLead, isLeadSquaredConfigured } from "@/lib/leadsquared";
import { prisma } from "@/lib/prisma";
import { ProviderDeliveryError } from "@/lib/provider-errors";
import { isWhatsAppConfigured, sendInquiryWelcome } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 10;
const LEASE_DURATION_MS = 15 * 60_000;

class IntegrationConfigurationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "IntegrationConfigurationError";
  }
}

class LeaseLostError extends Error {
  constructor() {
    super("The outbox lease is no longer active.");
    this.name = "LeaseLostError";
  }
}

function toInquiryInput(lead: {
  propertyType: string; budgetCategory: string; budgetCrores: number; locationFocus: string;
  name: string; email: string; countryCode: string; phone: string; nriStatus: boolean;
  projectTimeline: string; projectOfInterest: string | null; privacyNoticeVersion: string;
  utmSource: string | null; utmMedium: string | null; utmCampaign: string | null;
}) {
  return {
    propertyType: lead.propertyType,
    budgetCategory: lead.budgetCategory,
    budgetCrores: lead.budgetCrores,
    locationFocus: lead.locationFocus,
    name: lead.name,
    email: lead.email,
    countryCode: lead.countryCode,
    phone: lead.phone,
    nriStatus: lead.nriStatus,
    projectTimeline: lead.projectTimeline,
    projectOfInterest: lead.projectOfInterest ?? "",
    consent: true,
    privacyNoticeVersion: lead.privacyNoticeVersion,
    companyWebsite: "",
    utmSource: lead.utmSource ?? "direct",
    utmMedium: lead.utmMedium ?? undefined,
    utmCampaign: lead.utmCampaign ?? undefined,
  } as InquiryInput;
}

function providerStatus(job: ClaimedJob) {
  if (job.provider === IntegrationProvider.LEADSQUARED) return job.lead.crmStatus;
  if (job.provider === IntegrationProvider.WHATSAPP) return job.lead.whatsappStatus;
  return job.lead.emailStatus;
}

function safeErrorCode(error: unknown) {
  if (error instanceof ProviderDeliveryError || error instanceof IntegrationConfigurationError) return error.code.slice(0, 80);
  if (error instanceof LeaseLostError) return "LeaseLost";
  if (error instanceof Error && error.name !== "Error") return error.name.slice(0, 80);
  return "ProviderDeliveryError";
}

async function updateAggregateLeadStatus(transaction: Prisma.TransactionClient, leadId: string) {
  const jobs = await transaction.integrationOutbox.groupBy({ by: ["status"], where: { leadId }, _count: { _all: true } });
  const hasPending = jobs.some((job) => job.status === OutboxStatus.PENDING || job.status === OutboxStatus.PROCESSING);
  const hasFailed = jobs.some((job) => job.status === OutboxStatus.FAILED || job.status === OutboxStatus.UNCERTAIN);
  await transaction.lead.update({ where: { id: leadId }, data: { status: hasPending ? LeadStatus.QUEUED : hasFailed ? LeadStatus.PARTIAL_FAILED : LeadStatus.COMPLETE } });
}

async function markSucceeded(
  job: ClaimedJob,
  leadData?: Prisma.LeadUpdateInput,
  afterLeadUpdate?: (transaction: Prisma.TransactionClient) => Promise<void>,
  providerReference?: string,
) {
  await prisma.$transaction(async (transaction) => {
    if (leadData) await transaction.lead.update({ where: { id: job.leadId }, data: leadData });
    if (afterLeadUpdate) await afterLeadUpdate(transaction);
    const completed = await transaction.integrationOutbox.updateMany({
      where: { id: job.id, status: OutboxStatus.PROCESSING, lockToken: job.lockToken },
      data: { status: OutboxStatus.SUCCEEDED, completedAt: new Date(), lockedAt: null, lockToken: null, providerReference, lastErrorCode: null },
    });
    if (completed.count !== 1) throw new LeaseLostError();
    await updateAggregateLeadStatus(transaction, job.leadId);
  });
}

async function failJob(job: ClaimedJob, error: unknown) {
  const attempts = job.attemptCount + 1;
  const uncertain = error instanceof ProviderDeliveryError && error.uncertain;
  const terminal = uncertain || attempts >= MAX_ATTEMPTS;
  const nextAttemptAt = new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000);
  const errorCode = safeErrorCode(error);
  const deliveryStatus = uncertain ? DeliveryStatus.UNCERTAIN : terminal ? DeliveryStatus.FAILED : DeliveryStatus.PENDING;
  const providerData: Prisma.LeadUpdateInput = job.provider === IntegrationProvider.LEADSQUARED
    ? { crmStatus: deliveryStatus }
    : job.provider === IntegrationProvider.WHATSAPP
      ? { whatsappStatus: deliveryStatus }
      : { emailStatus: deliveryStatus };

  const changed = await prisma.$transaction(async (transaction) => {
    const released = await transaction.integrationOutbox.updateMany({
      where: { id: job.id, status: OutboxStatus.PROCESSING, lockToken: job.lockToken },
      data: {
        status: uncertain ? OutboxStatus.UNCERTAIN : terminal ? OutboxStatus.FAILED : OutboxStatus.PENDING,
        attemptCount: attempts,
        nextAttemptAt,
        lockedAt: null,
        lockToken: null,
        lastErrorCode: errorCode,
      },
    });
    if (released.count === 1) {
      await transaction.lead.update({ where: { id: job.leadId }, data: providerData });
      await updateAggregateLeadStatus(transaction, job.leadId);
    }
    return released.count === 1;
  });
  return changed;
}

async function persistAfterDelivery(action: () => Promise<void>, provider: string) {
  try {
    await action();
  } catch {
    throw new ProviderDeliveryError(`${provider}ResultNotPersisted`, true);
  }
}

async function processJob(job: ClaimedJob) {
  if (providerStatus(job) === DeliveryStatus.SUCCEEDED) {
    await markSucceeded(job);
    return;
  }

  const input = toInquiryInput(job.lead);
  const requestId = `outbox-${job.id}`;
  try {
    if (job.provider === IntegrationProvider.LEADSQUARED) {
      if (!isLeadSquaredConfigured()) throw new IntegrationConfigurationError("LeadSquaredNotConfigured");
      const crmLeadId = await captureLead(input, requestId);
      const whatsappConfigured = isWhatsAppConfigured();
      await persistAfterDelivery(() => markSucceeded(
        job,
        { crmStatus: DeliveryStatus.SUCCEEDED, crmLeadId, whatsappStatus: whatsappConfigured ? DeliveryStatus.PENDING : DeliveryStatus.NOT_CONFIGURED },
        whatsappConfigured ? async (transaction) => {
          await transaction.integrationOutbox.upsert({
            where: { leadId_provider: { leadId: job.leadId, provider: IntegrationProvider.WHATSAPP } },
            create: { leadId: job.leadId, provider: IntegrationProvider.WHATSAPP },
            update: {},
          });
        } : undefined,
        crmLeadId,
      ), "LeadSquared");
    } else if (job.provider === IntegrationProvider.WHATSAPP) {
      if (!isWhatsAppConfigured()) throw new IntegrationConfigurationError("WhatsAppNotConfigured");
      const messageId = await sendInquiryWelcome(input, process.env.DEFAULT_BROCHURE_URL || "https://www.parcelandform.in/work", requestId);
      await persistAfterDelivery(() => markSucceeded(job, { whatsappStatus: DeliveryStatus.SUCCEEDED }, undefined, messageId), "WhatsApp");
    } else {
      if (!isEmailConfigured()) throw new IntegrationConfigurationError("SendGridNotConfigured");
      const messageId = await notifyStudio(input, job.leadId, requestId);
      await persistAfterDelivery(() => markSucceeded(job, { emailStatus: DeliveryStatus.SUCCEEDED }, undefined, messageId), "SendGrid");
    }
  } catch (error) {
    console.error(JSON.stringify({ level: "error", event: "integration_delivery_failed", jobId: job.id, provider: job.provider, errorCode: safeErrorCode(error) }));
    await failJob(job, error);
  }
}

async function claimNextJob() {
  const candidate = await prisma.integrationOutbox.findFirst({
    where: { status: OutboxStatus.PENDING, nextAttemptAt: { lte: new Date() } },
    orderBy: { createdAt: "asc" },
    include: { lead: true },
  });
  if (!candidate) return null;

  const lockToken = randomUUID();
  const claimed = await prisma.integrationOutbox.updateMany({
    where: { id: candidate.id, status: OutboxStatus.PENDING },
    data: { status: OutboxStatus.PROCESSING, lockedAt: new Date(), lockToken },
  });
  return claimed.count === 1 ? { ...candidate, lockToken } : null;
}

type ClaimedJob = NonNullable<Awaited<ReturnType<typeof claimNextJob>>>;

async function quarantineStaleJobs() {
  const staleBefore = new Date(Date.now() - LEASE_DURATION_MS);
  const staleJobs = await prisma.integrationOutbox.findMany({
    where: { status: OutboxStatus.PROCESSING, lockedAt: { lt: staleBefore } },
    select: { id: true, leadId: true, provider: true, lockToken: true },
    take: 100,
  });
  let quarantined = 0;
  for (const job of staleJobs) {
    const providerData: Prisma.LeadUpdateInput = job.provider === IntegrationProvider.LEADSQUARED
      ? { crmStatus: DeliveryStatus.UNCERTAIN }
      : job.provider === IntegrationProvider.WHATSAPP
        ? { whatsappStatus: DeliveryStatus.UNCERTAIN }
        : { emailStatus: DeliveryStatus.UNCERTAIN };
    const changed = await prisma.$transaction(async (transaction) => {
      const result = await transaction.integrationOutbox.updateMany({
        where: { id: job.id, status: OutboxStatus.PROCESSING, lockToken: job.lockToken, lockedAt: { lt: staleBefore } },
        data: { status: OutboxStatus.UNCERTAIN, lockedAt: null, lockToken: null, lastErrorCode: "LeaseExpiredBeforeConfirmation" },
      });
      if (result.count === 1) {
        await transaction.lead.update({ where: { id: job.leadId }, data: providerData });
        await updateAggregateLeadStatus(transaction, job.leadId);
      }
      return result.count;
    });
    if (changed) quarantined += 1;
  }
  return quarantined;
}

async function enforceRetention() {
  const now = new Date();
  const inactiveBefore = new Date(now);
  inactiveBefore.setUTCFullYear(inactiveBefore.getUTCFullYear() - 1);
  const expired = await prisma.lead.findMany({
    where: {
      anonymizedAt: null,
      lastContactAt: { lte: inactiveBefore },
      legalHold: false,
      contractActive: false,
      OR: [{ retentionHoldUntil: null }, { retentionHoldUntil: { lte: now } }],
      privacyRequests: { none: { status: { in: [PrivacyRequestStatus.RECEIVED, PrivacyRequestStatus.IN_REVIEW] } } },
      outbox: { none: { status: { in: [OutboxStatus.PENDING, OutboxStatus.PROCESSING] } } },
    },
    select: { id: true },
    take: 100,
  });
  for (const lead of expired) {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: "Deleted",
          email: `deleted+${lead.id}@invalid.local`,
          phone: "",
          countryCode: "",
          nriStatus: false,
          propertyType: "Deleted",
          budgetCategory: "Deleted",
          budgetCrores: 0,
          locationFocus: "Deleted",
          projectOfInterest: null,
          projectTimeline: "Deleted",
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          requestFingerprint: "anonymized",
          crmLeadId: null,
          status: LeadStatus.ARCHIVED,
          anonymizedAt: now,
        },
      }),
      prisma.integrationOutbox.updateMany({ where: { leadId: lead.id }, data: { providerReference: null } }),
    ]);
  }
  const purgedEvents = await prisma.whatsAppWebhookEvent.deleteMany({ where: { expiresAt: { lte: now } } });
  return { anonymizedLeads: expired.length, purgedWebhookEvents: purgedEvents.count };
}

function authorizedWorkerRequest(request: NextRequest) {
  const supplied = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${configuredValue("CRON_SECRET")}`;
  const suppliedDigest = createHash("sha256").update(supplied).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(suppliedDigest, expectedDigest);
}

// Vercel Cron invokes the schedule with GET; POST remains available for other schedulers.
async function runWorker(request: NextRequest) {
  if (!hasConfiguredValues("CRON_SECRET")) return NextResponse.json({ success: false, message: "Worker is not configured." }, { status: 503 });
  if (!authorizedWorkerRequest(request)) return NextResponse.json({ success: false }, { status: 401 });
  if (!hasConfiguredValues("DATABASE_URL")) return NextResponse.json({ success: false, message: "Database is not configured." }, { status: 503 });

  try {
    const quarantined = await quarantineStaleJobs();
    const retention = await enforceRetention();
    let processed = 0;
    for (let index = 0; index < BATCH_SIZE; index += 1) {
      const job = await claimNextJob();
      if (!job) break;
      await processJob(job);
      processed += 1;
    }
    return NextResponse.json({ success: true, processed, quarantined, ...retention });
  } catch (error) {
    console.error(JSON.stringify({ level: "error", event: "integration_worker_failed", errorCode: safeErrorCode(error) }));
    return NextResponse.json({ success: false, message: "Integration worker failed." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return runWorker(request);
}

export async function POST(request: NextRequest) {
  return runWorker(request);
}
