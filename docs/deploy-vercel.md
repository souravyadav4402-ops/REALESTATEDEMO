# Deploy to Vercel

The app is Vercel-ready. Nothing needs to be configured for the six pages to render — every integration is optional and stays disabled until you supply real values.

## 1. Import the project

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import `souravyadav4402-ops/REALESTATEDEMO`.
3. Leave the defaults. Vercel detects Next.js, and `npm run build` plus the `postinstall` Prisma step work without any environment variables.
4. Deploy. You get a `*.vercel.app` URL.

Set **Production Branch** to `feat/premium-real-estate-portfolio` under Settings → Git if you want the default branch deployed, since this repository does not use `main`.

## 2. What works immediately

| Area | Without configuration |
| --- | --- |
| All six pages, styling, imagery, filters, currency display, Vastu viewer, dialogs | Fully working |
| `GET /api/currency` | Working, using validated fallback rates |
| Inquiry form submission | Returns a generic "temporarily unavailable" response |
| CRM / WhatsApp / email delivery | Disabled |

The inquiry rejection is intentional. Production intake fails closed until durable storage, a scheduler secret, a delivery provider, trusted client identity, and real controller identity all exist.

## 3. Environment variables to enable inquiries

Add these under Settings → Environment Variables, then redeploy. Leave anything you are not using blank.

**Required before production intake accepts a submission**

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled PostgreSQL connection string |
| `CRON_SECRET` | Random string, 16+ characters; also authenticates the cron request |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Shared rate limiting |
| `ALLOWED_ORIGINS` | Your production origin |
| `PRIVACY_CONTROLLER_NAME`, `PRIVACY_CONTACT_EMAIL`, `PUBLIC_SITE_URL`, `PUBLIC_STUDIO_PHONE`, `PUBLIC_WHATSAPP_URL` | Real controller identity; demo values are rejected |

Plus at least one delivery provider: LeadSquared (`LEADSQUARED_*`) or SendGrid (`SENDGRID_*`).

Do not set `TRUSTED_PROXY_IP_HEADER` on Vercel. The app already reads Vercel's trusted forwarding header.

`DATABASE_URL` must point at a pooled endpoint. Vercel Functions open many short-lived connections, so use your provider's pooling URL (Neon pooled, Supabase pooler, or PgBouncer) rather than a direct connection.

## 4. Run the migration

The build does not touch your database. Apply the schema once from your machine:

```bash
DATABASE_URL="<your pooled url>" npx prisma migrate deploy
```

## 5. Cron and plan limits

`vercel.json` schedules the delivery worker daily at 03:00 UTC:

```json
{ "path": "/api/internal/process-integrations", "schedule": "0 3 * * *" }
```

This is deliberate. Per [Vercel's cron pricing docs](https://vercel.com/docs/cron-jobs/usage-and-pricing), Hobby projects are limited to one run per day, and a more frequent expression **fails the deployment**. Hobby timing is also approximate, firing anywhere within the scheduled hour.

Once you are on Pro, change the schedule to `* * * * *` so queued inquiries are delivered within a minute instead of up to a day later.

Vercel sends cron requests as `GET` and automatically attaches `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set. The route accepts `GET` and `POST`, and rejects anything without the matching secret.

## 6. Custom domain

Add it under Settings → Domains, then update `ALLOWED_ORIGINS` and `PUBLIC_SITE_URL` to match and redeploy.

## Notes

- Imagery currently loads from Unsplash and is placeholder material. Replace it with licensed assets before any commercial launch.
- Portfolio projects, metrics, and RERA numbers are illustrative concept content, not real listings.
