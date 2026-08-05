# RafiulAnamLLC — Online Retail Store

Multi-category e-commerce storefront + admin panel, built with Next.js (App Router), Tailwind CSS, Prisma/Postgres, and NextAuth (Auth.js). See the PRD for full scope.

## Getting started

1. Copy `.env.example` to `.env` and fill in real values (never commit `.env`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push the Prisma schema to your Postgres database:
   ```bash
   npx prisma migrate dev
   ```
4. (Optional) Seed an admin user for local testing:
   ```bash
   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=changeme123 npx prisma db seed
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```

## Build status

This project is being built milestone by milestone per the PRD:

1. **Project setup** — Next.js + Tailwind + Prisma schema + auth scaffolding ✅
2. **Catalog** — categories, products (with variants), admin CRUD, CSV bulk import, storefront browse/category/search/detail pages ✅
3. **Cart** — add/update/remove, persists for guests (cookie) and accounts (DB), merges into the account on login/register ✅
4. **Checkout & payments** — Stripe Payment Intents + webhook-confirmed order creation ✅ (free shipping, no tax for MVP)
5. **Accounts** — order history, address book (with checkout prefill + "save this address") ✅ (password reset UI is still a stub pending an email provider)
6. **Admin dashboard** — order list/filter/status updates, customers, sales (30d) + low-stock alerts ✅
7. **Polish** — SEO (sitemap, robots.txt, per-page metadata, canonical URLs, noindex on account/admin/cart/checkout), fixed missing /about and /contact pages, transactional emails (order confirmation + shipping update via Resend), custom 404/error pages, route-level loading skeletons, and an accessibility pass (form labels, heading order, color contrast) verified with axe-core ✅
8. **Pre-launch** — env var audit, security review, seed-data safety ✅ (this commit)

## Pre-launch checklist

Done in code:
- [x] Browse → cart → Stripe checkout → webhook-confirmed order, end to end
- [x] Orders only ever created from the Stripe webhook, never the checkout page — a failed/abandoned payment creates no order
- [x] Admin can manage products, categories, and order statuses
- [x] Guest checkout works without an account
- [x] Responsive (checked at 375px/768px/1280px, no horizontal overflow) and accessible (0 axe-core violations across public/auth/account/admin pages)
- [x] No secrets in source or git history; `.env.example` covers every `process.env` var the app reads
- [x] Passwords hashed with bcrypt; cart/address/order mutations verify ownership; admin routes gated by role
- [x] Rate limiting on register, login, and checkout-intent creation (in-memory — see `lib/rateLimit.js` for the multi-instance-serverless caveat)
- [x] `prisma/seed.js` refuses to seed the default admin password when `NODE_ENV=production`

Still needs a decision or real credentials from you before going live:
- [ ] Real Stripe **live-mode** keys + a production webhook endpoint (currently test-mode keys)
- [ ] An email domain verified with Resend, so order confirmation/shipping emails actually send (`RESEND_API_KEY` / `EMAIL_FROM`)
- [ ] A real Postgres database reachable from wherever this deploys, with `npx prisma migrate deploy` run against it
- [ ] A decision on image hosting (Cloudinary/S3) — until then, `next.config.mjs` serves images unoptimized rather than guessing a `remotePatterns` host
- [ ] A real domain for `NEXT_PUBLIC_SITE_URL` / `NEXTAUTH_URL` (sitemap and canonical URLs currently point at whatever this is set to)
- [ ] A Lighthouse run against a real deployment (this sandbox couldn't run one — no browser devtools protocol access to a live Vercel URL from here)
