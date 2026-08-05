# RafiulAnamLLC — Online Retail Store

Multi-category e-commerce storefront + admin panel, built with Next.js (App Router), Tailwind CSS, Prisma/Postgres, and NextAuth (Auth.js). See the PRD for full scope.

## Design system — "Warm Ceramic"

The storefront (not the admin panel) follows a deliberate design system rather than default Tailwind styling:

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1C1B19` | Primary text, headings |
| `canvas` | `#F7F4EF` | Page background |
| `clay` | `#B5502F` | Primary accent — CTAs, links, active states |
| `clay-dark` | `#96411F` | Hover/pressed state for clay |
| `moss` | `#4B5B45` | Success states (e.g. the order-confirmation check) |
| `sand` | `#E7E0D4` | Borders, dividers, subtle surfaces |
| `stone` | `#6E6860` | Secondary/muted text |

All defined in `app/globals.css` via Tailwind v4's `@theme` block, so `bg-clay`, `text-stone`, etc. are real utilities. Type pairing is **Fraunces** (display, `font-display`) + **Inter** (body/UI, the default `font-sans`), loaded in `app/layout.jsx`.

Motion uses the `motion` package (Framer Motion's successor) — `components/ui/motion.jsx` has the shared `FadeIn`/`StaggerGrid`/`StaggerItem` primitives used for scroll-reveal entrances; product cards crossfade to a second image (or scale) on hover; add-to-cart morphs the button to a checkmark and opens the cart drawer; checkout steps slide between address and payment. Every animation is wrapped by a single `MotionConfig reducedMotion="user"` in `app/providers.jsx`, so `prefers-reduced-motion` is respected globally without per-component logic (verified — see Pre-launch checklist).

## Getting started

1. Copy `.env.example` to `.env` and fill in real values (never commit `.env`). At minimum you need `DATABASE_URL` and `NEXTAUTH_SECRET` (generate one with `npx auth secret`) to run the app at all; Stripe keys are needed for checkout, Resend for emails.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push the Prisma schema to your Postgres database:
   ```bash
   npx prisma migrate dev
   ```
4. Seed an admin user for local testing:
   ```bash
   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=changeme123 npx prisma db seed
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```
   The app is now at http://localhost:3000, with an admin panel at `/admin` (log in with the seeded credentials above).
6. **To test checkout**, Stripe needs to deliver a webhook to your machine. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then in a second terminal:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the `whsec_...` signing secret it prints into your `.env` as `STRIPE_WEBHOOK_SECRET`, and restart `npm run dev`. Use test card `4242 4242 4242 4242`, any future expiry, any CVC. Watch the `stripe listen` terminal — you should see `payment_intent.succeeded` come through, and the order should appear on `/checkout/success` and in `/account/orders` / `/admin/orders` within a couple seconds.

## Testing the storefront end to end

1. **Browse & search**: add a category and a product (with at least one variant) at `/admin/categories` and `/admin/products/new`, then confirm it shows up on `/products`, its category page, and `/search?q=...`.
2. **Cart**: add to cart as a guest (no login) — it should persist across a page reload (cookie-backed). Adjust quantity and remove items on `/cart`.
3. **Guest checkout**: from `/cart`, go to `/checkout`, fill the address form, pay with the Stripe test card. Confirm the order shows up in `/admin/orders` with status `PAID`, and that stock decremented on the product's variant.
4. **Account + cart merge**: add something to cart as a guest, then register a new account — the cart should carry over instead of resetting to empty.
5. **Admin order flow**: on `/admin/orders/[id]`, change the status to `SHIPPED` — it should immediately reflect on the customer's `/account/orders`.
6. **CSV import**: try `/admin/products/import` with a small CSV (columns documented on that page) to bulk-load products.
7. **Rate limiting**: submitting the register form more than 10 times in 15 minutes from the same IP should start returning "Too many attempts" — this is expected, not a bug.

## Build status

This project is being built milestone by milestone per the PRD:

1. **Project setup** — Next.js + Tailwind + Prisma schema + auth scaffolding ✅
2. **Catalog** — categories, products (with variants), admin CRUD, CSV bulk import, storefront browse/category/search/detail pages ✅
3. **Cart** — add/update/remove, persists for guests (cookie) and accounts (DB), merges into the account on login/register ✅
4. **Checkout & payments** — Stripe Payment Intents + webhook-confirmed order creation ✅ (free shipping, no tax for MVP)
5. **Accounts** — order history, address book (with checkout prefill + "save this address") ✅ (password reset UI is still a stub pending an email provider)
6. **Admin dashboard** — order list/filter/status updates, customers, sales (30d) + low-stock alerts ✅
7. **Polish** — SEO (sitemap, robots.txt, per-page metadata, canonical URLs, noindex on account/admin/cart/checkout), fixed missing /about and /contact pages, transactional emails (order confirmation + shipping update via Resend), custom 404/error pages, route-level loading skeletons, and an accessibility pass (form labels, heading order, color contrast) verified with axe-core ✅
8. **Pre-launch** — env var audit, security review, seed-data safety ✅

## Design pass (post-PRD addendum)

A follow-up brief asked for a considered, premium visual identity instead of default-looking Tailwind components. Delivered: the "Warm Ceramic" design system above, a slide-in cart drawer (`components/storefront/CartDrawer.jsx`) with an add-to-cart micro-interaction and live badge count, scroll-reveal entrances and staggered product-grid animation, product-card hover crossfade, and animated checkout step transitions — across the full storefront (home, browse, product detail, cart, checkout, auth, account, about/contact, 404/error). The admin panel was intentionally left as-is; the brief scoped this to the customer-facing storefront.

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
