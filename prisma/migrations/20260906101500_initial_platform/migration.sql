-- CreateEnum
CREATE TYPE "AssetClass" AS ENUM ('LUXURY_RESIDENTIAL', 'COMMERCIAL', 'BOUTIQUE_VILLAS', 'ESTATE');
CREATE TYPE "ProjectStatus" AS ENUM ('PRE_LAUNCH', 'UNDER_CONSTRUCTION', 'READY', 'SOLD_OUT');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'MODEL_3D', 'BROCHURE');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUEUED', 'COMPLETE', 'PARTIAL_FAILED', 'ARCHIVED');
CREATE TYPE "DeliveryStatus" AS ENUM ('NOT_CONFIGURED', 'PENDING', 'SUCCEEDED', 'FAILED', 'UNCERTAIN');
CREATE TYPE "IntegrationProvider" AS ENUM ('LEADSQUARED', 'WHATSAPP', 'SENDGRID');
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'UNCERTAIN');
CREATE TYPE "PrivacyRequestType" AS ENUM ('ACCESS', 'CORRECTION', 'DELETION', 'OBJECTION', 'WITHDRAWAL');
CREATE TYPE "PrivacyRequestStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "projects" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "assetClass" "AssetClass" NOT NULL,
  "priceRangeINR" DECIMAL(16,2) NOT NULL,
  "priceRangeUSD" DECIMAL(16,2) NOT NULL,
  "status" "ProjectStatus" NOT NULL,
  "reraNumber" TEXT NOT NULL,
  "description" TEXT,
  "brochureUrl" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "type" "MediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "altText" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "floor_plans" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "bhkType" TEXT NOT NULL,
  "sqft" INTEGER NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "vastuData" JSONB,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "floor_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leads" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "requestFingerprint" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "nriStatus" BOOLEAN NOT NULL DEFAULT false,
  "propertyType" TEXT NOT NULL,
  "budgetCategory" TEXT NOT NULL,
  "budgetCrores" INTEGER NOT NULL,
  "locationFocus" TEXT NOT NULL,
  "projectOfInterest" TEXT,
  "projectTimeline" TEXT NOT NULL,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "crmStatus" "DeliveryStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "whatsappStatus" "DeliveryStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "emailStatus" "DeliveryStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "crmLeadId" TEXT,
  "consentAt" TIMESTAMP(3) NOT NULL,
  "privacyNoticeVersion" TEXT NOT NULL,
  "lastContactAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "retentionHoldUntil" TIMESTAMP(3),
  "legalHold" BOOLEAN NOT NULL DEFAULT false,
  "contractActive" BOOLEAN NOT NULL DEFAULT false,
  "anonymizedAt" TIMESTAMP(3),
  "projectId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integration_outbox" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "provider" "IntegrationProvider" NOT NULL,
  "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "lockToken" TEXT,
  "completedAt" TIMESTAMP(3),
  "providerReference" TEXT,
  "lastErrorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "integration_outbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "privacy_requests" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "type" "PrivacyRequestType" NOT NULL,
  "status" "PrivacyRequestStatus" NOT NULL DEFAULT 'RECEIVED',
  "requesterHash" TEXT NOT NULL,
  "resolutionCode" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "privacy_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "whatsapp_webhook_events" (
  "id" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "whatsapp_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");
CREATE UNIQUE INDEX "projects_reraNumber_key" ON "projects"("reraNumber");
CREATE INDEX "projects_region_assetClass_status_idx" ON "projects"("region", "assetClass", "status");
CREATE INDEX "projects_featured_publishedAt_idx" ON "projects"("featured", "publishedAt" DESC);
CREATE INDEX "projects_priceRangeINR_idx" ON "projects"("priceRangeINR");
CREATE INDEX "media_projectId_type_sortOrder_idx" ON "media"("projectId", "type", "sortOrder");
CREATE INDEX "floor_plans_projectId_bhkType_sqft_idx" ON "floor_plans"("projectId", "bhkType", "sqft");
CREATE INDEX "floor_plans_direction_idx" ON "floor_plans"("direction");
CREATE UNIQUE INDEX "leads_idempotencyKey_key" ON "leads"("idempotencyKey");
CREATE INDEX "leads_email_createdAt_idx" ON "leads"("email", "createdAt" DESC);
CREATE INDEX "leads_phone_createdAt_idx" ON "leads"("phone", "createdAt" DESC);
CREATE INDEX "leads_nriStatus_budgetCategory_createdAt_idx" ON "leads"("nriStatus", "budgetCategory", "createdAt" DESC);
CREATE INDEX "leads_status_createdAt_idx" ON "leads"("status", "createdAt");
CREATE INDEX "leads_lastContactAt_anonymizedAt_idx" ON "leads"("lastContactAt", "anonymizedAt");
CREATE INDEX "leads_utmSource_createdAt_idx" ON "leads"("utmSource", "createdAt");
CREATE INDEX "integration_outbox_status_nextAttemptAt_idx" ON "integration_outbox"("status", "nextAttemptAt");
CREATE INDEX "integration_outbox_leadId_status_idx" ON "integration_outbox"("leadId", "status");
CREATE UNIQUE INDEX "integration_outbox_leadId_provider_key" ON "integration_outbox"("leadId", "provider");
CREATE INDEX "privacy_requests_status_receivedAt_idx" ON "privacy_requests"("status", "receivedAt");
CREATE INDEX "privacy_requests_leadId_receivedAt_idx" ON "privacy_requests"("leadId", "receivedAt");
CREATE UNIQUE INDEX "whatsapp_webhook_events_payloadHash_key" ON "whatsapp_webhook_events"("payloadHash");
CREATE INDEX "whatsapp_webhook_events_processedAt_receivedAt_idx" ON "whatsapp_webhook_events"("processedAt", "receivedAt");
CREATE INDEX "whatsapp_webhook_events_expiresAt_idx" ON "whatsapp_webhook_events"("expiresAt");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "integration_outbox" ADD CONSTRAINT "integration_outbox_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "privacy_requests" ADD CONSTRAINT "privacy_requests_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
