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
4. **Checkout & payments** — Stripe Payment Intents + webhook-confirmed order creation ✅ (this commit; free shipping, no tax for MVP)
5. Accounts — order history, address book, password reset
6. Admin dashboard — orders, sales overview, low-stock alerts
7. Polish — SEO, responsive QA, transactional emails
8. Pre-launch — env audit, security review, performance pass
