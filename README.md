# RAFIUL ANAM LLC

Corporate website for Amazon e-commerce, ANAMIGO Fleet, ANAMSOFT, and ANAMCART. The site uses Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn-style components, and Neon PostgreSQL, Prisma, Clerk, and Cloudinary. The homepage loads its Three.js Earth on demand and uses Motion for the hero and business explorer.

## Local development

Requires Node.js 22.18 or later and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. With no database configuration, the site displays the supplied corporate and business copy, an empty product catalogue, and clear availability messages for inquiries and administration.

## Neon, Prisma, Clerk, and Cloudinary migration

Prisma handles all application database access. Use this procedure to transfer the retained source database and media into Neon and Cloudinary. Validate the import and provider integrations in a preview deployment.

1. Create an empty Neon staging branch. Set the pooled TLS URL in `DATABASE_URL` and the direct TLS URL in `DATABASE_URL_UNPOOLED`. Set the Clerk test instance keys and Cloudinary credentials from `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to the exact preview origin. Set the publishable Clerk key and Cloudinary cloud name at build time. Keep each environment's secret values in its own secret store.
2. Run `npm run db:generate` and then `npm run db:migrate` against the staging branch. The app uses the pooled URL through the Neon driver adapter. Prisma Migrate and the operator commands use the direct URL from a separate release environment. Give the runtime role the app's data permissions and keep role assignments and schema changes in the release role.
3. Back up the current database and media. Export a consistent copy of the application records with [the read-only export query](prisma/legacy-export.sql). Save the JSON result outside the repository with restricted access. Keep the original authentication data and storage backups in the source system.
4. Copy each referenced uploaded image to the corporate Cloudinary cloud and verify the resulting HTTPS URL opens. Record the mappings in a JSON array with `source`, `url`, `cloudinaryId`, `width`, `height`, `bytes`, and `format`. Use the exact old stored path as `source`. Bundled `/media/*.webp` images may retain their paths. Then run `npm run db:import -- <snapshot.json> <media-map.json>` and compare counts. Repeat with `--apply` to import into the empty staging branch. The import preserves record IDs, timestamps, relationships, draft states, business URLs, and role rows.
5. Invite the approved administrators to Clerk. Review each identity before running `npm run db:link-admin -- <existing-admin-uuid> <verified-clerk-user-id> --apply`. Imported users start unlinked. For a branch with zero administrator roles, an approved operator can use `first-admin` in place of the UUID. When using the optional `/api/webhooks/clerk` endpoint, configure its signing secret and enable `user.deleted` to disable the associated app account. API clients switch to a Clerk session bearer token issued on the configured site origin.
6. Deploy the configured preview and verify all four business profiles, catalogue and sitemap, administrator and ordinary account permissions, media uploads and replacement, and inquiry persistence and quotas. Media uploads run on the server. Replacement queues the previous asset only if it is unreferenced. With explicit approval for the selected asset, `npm run db:purge-media -- <asset-uuid> --apply` deletes that eligible asset. The command without `--apply` checks eligibility.
7. Plan a short write pause for admin and inquiry writes, then repeat the export/import verification on the production branch and switch the deployment. Keep the existing environment, source data and snapshots available during the rollback window. If rollback follows target writes, reconcile those writes before reopening the original backend.

### Environment variables

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The site origin, such as `http://localhost:3000` or your production HTTPS origin. Used in canonical URLs, structured data, and the sitemap. |
| `DATABASE_URL` | Pooled Neon URL for the app. |
| `DATABASE_URL_UNPOOLED` | Direct Neon URL for Prisma migrations and operator commands. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Matching Clerk instance keys. |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Optional signing secret for account-deletion events. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary account settings for site media. |
| `INQUIRY_RATE_LIMIT_SECRET` | A server-only value of 64 hexadecimal characters. Generate once for each environment. |
| `INQUIRY_TRUSTED_IP_HEADER` | Optional for self-hosting. A header set and overwritten by your reverse proxy with a single canonical client IP. Vercel uses its platform-supplied header automatically. With no trusted IP, submissions share a rate bucket. |

Generate the inquiry secret locally and store it in your deployment secret manager and local environment as appropriate.

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

### Content to supply before launch

- **Settings and CEO** — verified contact details, social URLs, logos, an official portrait, and any approved biography or corporate copy.
- **Businesses** — official HTTPS URLs for ANAMIGO Fleet and ANAMSOFT. The site enables each visit link once its URL is saved. ANAMIGO Fleet and ANAMSOFT each have an introduction page on this site.
- **Products and categories** — add real product descriptions, rights-cleared photos and alt text, and direct U.S. Amazon URLs containing an ASIN. The app checks URL structure and domain. Open the listing to verify the product and availability before publishing. Prices are optional and manually maintained.
- **Privacy and terms** — review the supplied drafts against the live company contact, hosting setup, and inquiry retention practices before publishing.

Generated illustrations in [public/media](public/media) depict generic architecture, shipping cartons, a delivery van, and a semiconductor. Cloudinary serves uploaded site media. Use publication-ready images for this public delivery path. The reviewed media purge command handles eligible orphaned assets.

The four WebP files were cropped from a contact sheet created with built-in ImageGen.

The Earth textures are by Solar System Scope and licensed under CC BY 4.0. The source maps were converted to WebP, the cloud layer was downscaled, and the static poster was rendered from those maps. The Natural Earth land dataset used for the interactive map is in the public domain. [Solar System Scope textures](https://www.solarsystemscope.com/textures/) · [CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/) · [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/)

<details>
<summary>ImageGen prompt</summary>

> Create one landscape 3:2 raster contact sheet for a premium minimalist corporate website. Strict layout: top 2/3 is ONE uninterrupted wide editorial architecture photograph, bottom 1/3 is three equal-width separate photos, no gutters, intended for cropping into four files. Top: upward street-level perspective of a very dark midnight navy glass and concrete modern high rise on RIGHT side, diagonal lines converging to upper middle, left 43% near-solid dark midnight gradient of sky for white copy overlay. A handful of warm office lights, deep twilight, quiet international editorial style, realistic architecture, no identifiable location. Bottom left: premium close up stack of three unbranded kraft shipping boxes in warm light. Bottom middle: rear 3/4 white unbranded delivery van at modern industrial loading bay in Spain-inspired environment, architectural greys. Bottom right: macro photography of blue illuminated dark semiconductor chip / precise electronic board. Photos only, no text, signs, logos, humans, watermark, frames, or borders.

</details>

## Admin API

The dashboard and the HTTP API use the same record validation and server-side administrator checks. API clients send `Authorization: Bearer <Clerk session token>` from the website administrator’s authenticated session. The publishable key alone cannot access these endpoints. Use HTTPS outside local development.

| Resource under `/api/admin/` | Collection | Individual record |
| --- | --- | --- |
| `products`, `categories`, `gallery`, `socials` | GET, POST | GET, PUT, DELETE with a record UUID |
| `businesses` | GET | GET, PUT with a record UUID |
| `inquiries` | GET | GET, PUT, DELETE with a record UUID |
| `settings`, `ceo` | GET, PUT | Use the collection URL |

POST to `/api/admin/inquiries/<id>/read` to mark an inquiry as read. Visitors submit inquiries through the rate-limited contact form. Collection reads accept `page` and `limit` and return `data`, `page`, `limit`, and `total`. The limit defaults to 25 and accepts up to 100.

For writes, submit JSON or multipart form data using the dashboard editor’s field names. PUT takes the full editable record. For example, send `{"name":"Office supplies","slug":"office-supplies"}` to POST `/api/admin/categories`. Use multipart data for images. The request cap is 4 MB, and existing individual image limits apply. Successful writes return the affected record ID. Keep access tokens out of source files and shared logs.

## Verification

```sh
npm run typecheck
npm run lint
npm run test:db
npm run build
npm test
```

Run the repeatable code, database, and browser checks with one command.

```sh
npm run check
```

The PostgreSQL suite applies the Prisma migration in PGlite. Playwright runs the public routes, access guards, and Earth scene on an isolated production build without provider credentials. It uses Edge by default, or Chrome when configured through PLAYWRIGHT_BROWSER_CHANNEL. Use the staging smoke test below to verify the hosted database, sign-in, uploads, and inquiries.

## Deploy on Vercel

1. Put the source in your Git repository and import it as a Next.js project in Vercel.
2. Apply the migration and configure Clerk, Cloudinary, the admin role, and the inquiry secret as above. Add the environment variables for each intended Vercel environment. Use the final HTTPS origin for production.
3. Deploy and open the result. Sign in with an administrator and verify an ordinary Clerk account cannot manage content. Create a draft product, upload and preview its image, publish it, confirm the Amazon link, and unpublish or remove the test entry. Send a test inquiry through the public form, confirm it appears in the admin inbox, and delete it. Verify the configured business links and canonical origin.
