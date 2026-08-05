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
   npx prisma migrate dev --name init
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Build status

This project is being built milestone by milestone per the PRD:

1. **Project setup** — Next.js + Tailwind + Prisma schema + auth scaffolding ✅ (this commit)
2. Catalog — categories, products, admin CRUD, storefront browse/search
3. Cart
4. Checkout & payments (Stripe)
5. Accounts — order history, address book, password reset
6. Admin dashboard — orders, sales overview, low-stock alerts
7. Polish — SEO, responsive QA, transactional emails
8. Pre-launch — env audit, security review, performance pass
