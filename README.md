# Parcel & Form India

A production-oriented six-page Next.js platform for a luxury Indian real-estate digital studio. It combines editorial art direction with a qualified inquiry workflow, PostgreSQL/Prisma models, a durable LeadSquared/WhatsApp/SendGrid delivery outbox, multi-currency support, and integration-ready Sanity/S3 utilities.

> All portfolio projects, values and outcomes in this demo are illustrative concept studies—not active listings or completed client claims.

## Routes
- `/` Home
- `/work` Filterable portfolio and Vastu case-study demonstration
- `/services` Strategy, CGI, web and NRI capability matrix
- `/approach` Indian cultural principles and delivery process
- `/journal` Thought-leadership index
- `/contact` Four-step qualified inquiry wizard

## Local setup
```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run dev
```
Open `http://localhost:3000`. In non-production, the inquiry route can return a successful demo response without a database. Production deliberately fails closed unless PostgreSQL, Upstash, the worker secret, at least one studio-visible provider, and deployment-specific controller identity/contact settings are configured.

## Quality commands
```bash
npm run validate
npm run typecheck
npm run lint
npm run build
```

`validate` checks the exact metadata/navigation JSON contract, confirms the committed initial migration matches the Prisma schema, and verifies literal internal targets against real App Router pages. Production inquiry delivery also requires a scheduler to call the authenticated integration worker; see the operations guide.

## Database
```bash
npm run db:migrate       # development migration
npx prisma migrate deploy # reviewed production migrations
npm run db:studio
```

## Documentation
- [Information architecture, routing and state machine](docs/information-architecture.md)
- [Design system and CSS/Tailwind tokens](docs/design-system.md)
- [Accessibility and performance](docs/accessibility-performance.md)
- [Backend, integrations and operations](docs/backend-operations.md)

## Architecture notes
Pages are Server Components by default. Client JavaScript is isolated to navigation, reveal, filtering, currency/Vastu demonstrations, legal modal and inquiry form. Remote Unsplash images are placeholders; replace them with licensed, optimized CDN media before production.
