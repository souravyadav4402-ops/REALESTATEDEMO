# Backend, Integrations & Operations

## Request lifecycle
1. `POST /api/inquire` rejects disallowed origins and streams at most 16KB of request data.
2. A trusted edge-provided client identifier feeds an Upstash sliding-window limit of five attempts per ten minutes. Production fails closed when proxy identity or rate limiting is unavailable.
3. Honeypot submissions receive a neutral success response.
4. Zod strictly validates and normalizes all fields, including the privacy-notice version and a consistent GDV category/value pair.
5. One PostgreSQL transaction creates the lead and initial LeadSquared/SendGrid outbox rows. A repeated `Idempotency-Key` returns the original inquiry only when its payload fingerprint matches.
6. The API returns after the transaction commits; it does not wait for external vendors.
7. An authenticated scheduler calls `POST /api/internal/process-integrations` every minute. The worker leases up to ten due jobs, uses stable outbox request IDs, and retries confirmed provider failures with exponential backoff up to five attempts.
8. LeadSquared success queues WhatsApp in the same database transaction that records CRM completion. SendGrid is independent. Provider references, delivery status and outbox completion are committed together, and already-succeeded providers are skipped on retry.
9. Ambiguous network outcomes and expired processing leases move to `UNCERTAIN` for operator reconciliation instead of being replayed. Production fails closed unless PostgreSQL, trusted proxy identity, Redis, worker authentication, a studio-visible provider and deployment-specific privacy identity are configured.

## Integration worker operations
Set a high-entropy `CRON_SECRET`, then have a trusted scheduler send `Authorization: Bearer <CRON_SECRET>` to the internal worker once per minute. Do not expose the secret to browsers. Each claim carries a unique token. A lease older than 15 minutes is quarantined as uncertain, never automatically replayed, because the provider may have accepted the request before the worker stopped.

Alert on pending-job age, uncertain and terminal deliveries, provider error codes, and divergence between provider delivery status and outbox status. Logs contain inquiry/job identifiers but no contact details. Reconcile provider references and dashboards before manually resetting an uncertain row. A scheduler is mandatory: without it, accepted inquiries remain queued. The same worker anonymizes expired lead PII and purges expired stored WhatsApp events.

## LeadSquared routing
Tags are deterministic:
- `NRI` or `DOMESTIC`.
- Market tag (`MUMBAI`, `DELHI-NCR`, `GOA`, etc.).
- `UHNI-250CR-PLUS` + `PREMIUM-DESK` for ₹250 Cr+.
- `HNI-50-250CR` for ₹50–250 Cr.
- `VILLA-DESK` for boutique villas.

LeadSquared custom field API names (`mx_*`) must be created in the tenant before launch. Use a sandbox tenant for end-to-end validation and configure its deduplication behavior around the stable request ID.

## Environment variables
Copy `.env.example` to `.env.local`; blank optional values mean disabled. Never commit secrets. Use separate credentials per environment and a managed secret store in production.

- Production controller: verified `PRIVACY_CONTROLLER_NAME`, `PRIVACY_CONTACT_EMAIL`, `PUBLIC_SITE_URL`, `PUBLIC_STUDIO_PHONE`, and `PUBLIC_WHATSAPP_URL`; demo values disable production intake.
- PostgreSQL: pooled `DATABASE_URL`.
- Request trust: `TRUSTED_PROXY_IP_HEADER` only when the edge overwrites that header, or Vercel's trusted forwarding header when deployed there.
- Worker: high-entropy `CRON_SECRET` held by the scheduler.
- LeadSquared: base URL, access key and secret key.
- WhatsApp: Graph version, permanent system-user token, phone number ID, approved template, app secret and webhook verify token.
- SendGrid: restricted API key, verified sender and studio destination.
- Upstash: REST URL/token.
- S3: least-privilege IAM credentials, region and private bucket.
- Sanity: public project/dataset IDs and a server-only read token only for private content.
- Currency: provider URL and conservative validated fallback rates.

Placeholder-like values are rejected and cannot activate an integration.

## PostgreSQL and indexing
`prisma/schema.prisma` defines compound indexes around actual access patterns:
- Project browse: `(region, assetClass, status)`.
- Featured order: `(featured, publishedAt DESC)`.
- Price filtering: `priceRangeINR`.
- Project media: `(projectId, type, sortOrder)`.
- Floor plans: `(projectId, bhkType, sqft)` and direction.
- Lead lookup/dedup review: email or phone with descending creation time.
- Sales routing queue: `(nriStatus, budgetCategory, createdAt DESC)`.
- Lead operations: `(status, createdAt)`.
- Outbox claims: `(status, nextAttemptAt)`.
- Attribution reporting: `(utmSource, createdAt)`.

Run `EXPLAIN (ANALYZE, BUFFERS)` against production-like data before adding indexes. Avoid indexing every column; write amplification matters. Use Prisma connection pooling, bounded pagination and explicit `select` projections.

## S3 / 3D asset strategy
- Keep the bucket private; deliver through CloudFront signed cookies/URLs or short-lived S3 URLs.
- Separate prefixes: `renders/`, `video/`, `models/`, `brochures/`.
- Fingerprint immutable 4K/WebGL assets and cache for one year at the CDN.
- Validate content type, extension and key server-side; scan uploads; apply lifecycle tiers to source renders.
- Use KTX2 textures and DRACO/Meshopt GLB compression; ship a low-resolution preview/poster first.
- `lib/storage.ts` provides five-minute signed PUT/GET primitives. Place signing endpoints behind staff authentication and file-size policy; do not expose them publicly.

## Sanity content model
Sanity and S3 are integration-ready optional scaffolding; the current demonstration renders local typed content. Recommended Sanity types are `project`, `journalArticle`, `teamMember`, `legalDisclosure`, and `siteSettings`. Project validation must require RERA number, authority link and disclaimer when `isPublished` and `isRealListing` are true. Use webhooks to trigger targeted Next.js revalidation after publication.

## Security controls
- Strict Zod schema and control-character normalization.
- Same-origin plus explicit CORS allowlist.
- Shared, fail-closed rate limiting.
- Bounded request/webhook streams and provider timeouts.
- Generic client errors; structured logs contain request/inquiry IDs but no email/phone.
- Bounded HMAC-verified WhatsApp webhook that persists and deduplicates signed payloads before acknowledgement.
- Security headers in `next.config.ts`.
- Private secrets never use `NEXT_PUBLIC_`.
- Add managed WAF/bot protection, CSP nonces, centralized audit logs and automated dependency scanning before production.

## RERA, privacy and retention
RERA content is jurisdiction-specific and must be supplied and approved by the promoter’s legal team. Store disclaimer versions and review timestamps. The contact route publishes the inquiry privacy notice, and each lead stores its accepted notice version, consent timestamp, last meaningful contact, contract/legal-hold state and optional retention hold. The scheduled worker anonymizes PII only after 12 months of inactivity, after delivery jobs leave active states, and when no contract, legal/temporary hold or active privacy request applies. It clears external references and purges stored webhook payloads after 30 days. `PrivacyRequest` records support auditable access, correction, deletion, objection and withdrawal handling; restrict their operator workflow to authenticated staff.

## Deployment sequence
1. Provision PostgreSQL and a pooled `DATABASE_URL`.
2. Run `npm ci`, `npm run db:generate`, and reviewed `prisma migrate deploy`.
3. Configure deployment-specific controller identity/contact settings, trusted proxy identity and Upstash before exposing `/api/inquire`. Production intake remains disabled for demo identity values.
4. Configure the scheduler and `CRON_SECRET`; verify worker health and queue-age alerts.
5. Verify LeadSquared sandbox custom fields, tags and deduplication.
6. Approve the WhatsApp template and validate the signed webhook.
7. Verify SendGrid sender/domain authentication.
8. Move production imagery to a controlled CDN and configure asset hosts.
9. Run `npm run validate`, typecheck, lint, build, accessibility and performance gates.
10. Deploy a canary, submit a synthetic inquiry, and confirm database commit followed by worker-driven CRM, WhatsApp and email delivery.
