# HomePros

HomePros is a homeowner lead marketplace run by Cartley. A homeowner describes a project. HomePros shares that request with at most three approved contractors who cover the ZIP and the trade. Contractors pay for the introduction. Homeowners do not.

The public site is configured for `https://homepros.cartley.com` until the production domain is chosen. Change `NEXT_PUBLIC_SITE_URL` when it is decided.

## What the MVP does

- Marketing home page, plus landing pages for Roofing (shingle or metal), HVAC, Windows, Siding, Gutters (including gutter guards), and Flooring.
- Privacy, terms, and a contractor application.
- Mobile-first quote form: ZIP, project type, project details, timeline, homeowner status, contact info, then a consent step that names the matched businesses.
- Stores the exact consent text, timestamp, IP, user agent, and page URL with each lead. Also stores `utm_*`, `gclid`, and `fbclid` when present.
- Matches approved contractors by ZIP, category, and optional monthly cap. The per-lead cap is three. If nobody matches, the lead is still saved and the homeowner is told.
- Emails each matched contractor through Resend when `RESEND_API_KEY` is set, and logs the message to the console otherwise. Posts an optional per-contractor webhook.
- Admin area: vet or approve contractors, edit ZIP codes, categories, and caps, filter leads, export CSV, see assignments and the consent record, mark a lead returned or invalid.
- Contractor portal: assigned leads, and edits to profile, service area, and categories.
- Pixel hooks: events go to `dataLayer`, `gtag`, and `fbq` when those exist. GA and Meta scripts load only if their public IDs are set.

Billing and paid ads are out of scope. The data and event hooks are in place for both.

## Stack

Next.js (App Router) and TypeScript, Tailwind CSS, Prisma, PostgreSQL. Local development can use Docker or any Postgres 16 database. Production should use a pooled Postgres such as Neon.

## Local setup

1. Start Postgres. With Docker:

   ```bash
   docker compose up -d
   ```

   Or use a local Postgres database and set the URLs below. The database role needs to create the shadow database Prisma uses for `migrate dev`.

2. Copy the environment file and adjust it if your database is not on localhost.

   ```bash
   cp .env.example .env
   ```

3. Install, migrate, and seed.

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

`npm test` runs the matching, consent, and form-validation tests. `npm run build` generates the Prisma client, applies migrations, and builds the Next.js app.

### Seed logins

These passwords are for the local seed data only. Change them before any shared environment.

| Who | Email | Password |
| --- | --- | --- |
| Admin | admin@homepros.cartley.com | HomeProsAdmin!2026 |
| Every seeded contractor | the contractor's email, for example hillcountry@example.com | HomeProsPortal!2026 |

ZIP `78704` has at least two approved contractors in each launch category. Roofing there matches Hill Country Roofing, Live Oak Metal Roofs, and South Congress Roof Co. ZIP `99501` is uncovered, so a flooring request there is saved as unmatched.

Pending, vetted, and suspended contractors are in the seed and are not matched. Live Oak Metal Roofs has a monthly cap of 4. Clarksville Exteriors has a cap of 3.

## Try the homeowner flow

1. Start at the home page and enter `78704`, or open a category page such as `/roofing`.
2. Walk the quote form through contact info.
3. On the last step, confirm the business names and check the consent box.
4. The thank-you page lists those pros. The server logs an email for each one when `RESEND_API_KEY` is empty. The admin lead detail also shows a delivery row with provider `console`.
5. Sign in as the admin and open Leads. The new request is there, with the consent text, IP, user agent, page URL, and any ad parameters.
6. Sign in as `hillcountry@example.com` and confirm the lead is on the portal.

To capture ad parameters, open a URL like:

```text
http://localhost:3000/?utm_source=newsletter&utm_medium=email&gclid=test-gclid&fbclid=test-fbclid
```

Submit a quote in that browser. The lead stores those values.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Runtime Postgres URL. On Neon, use the pooled connection. |
| `DIRECT_URL` | Yes | Direct Postgres URL for migrations. Locally this can match `DATABASE_URL`. |
| `AUTH_SECRET` | Yes | Signs the admin and contractor session cookie. Use at least 16 random characters. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public origin. Placeholder: `https://homepros.cartley.com`. |
| `EMAIL_FROM` | For real email | From address Resend will send as. |
| `RESEND_API_KEY` | No | When set, lead email goes through Resend. When empty, email is printed to the server console. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Loads gtag when it looks like `G-XXXX`. |
| `NEXT_PUBLIC_META_PIXEL_ID` | No | Loads the Meta pixel when it is numeric. |

Quote events: `quote_started`, `quote_step_completed`, `matches_shown`, and `lead_submitted`. A submitted lead also calls `generate_lead` and Meta `Lead` when those pixels are present. A successful contractor application emits `contractor_signup`. The helpers live in `src/lib/tracking.ts`. Listen with `window.addEventListener("homepros:event", ...)` or read `window.dataLayer`.

## Vercel

1. Create a Postgres database from the Vercel Marketplace (Neon is a good fit) and attach it to the project.
2. Set `DATABASE_URL` to the pooled connection string and `DIRECT_URL` to the direct connection string. Prisma migrations use `DIRECT_URL`.
3. Set `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `EMAIL_FROM`. Add `RESEND_API_KEY` when you want real contractor email. Add the pixel IDs only when those accounts exist.
4. Import this repository. The build command is `npm run build`, which runs `prisma generate`, `prisma migrate deploy`, and `next build`. The build environment must be able to reach the database.
5. Do not run the seed against production unless you intend to load the sample contractors. Create the real admin separately, and have contractors apply through `/contractors`.
6. Point the chosen domain at the deployment, then set `NEXT_PUBLIC_SITE_URL` to that origin and redeploy.

The app uses the Node.js runtime and a `src/proxy.ts` auth gate for `/admin` and `/portal`.

## Project map

- `src/app/(marketing)` public pages and the quote flow
- `src/app/admin` contractor vetting, leads, and CSV export
- `src/app/portal` contractor login, leads, and profile
- `src/lib/matching.ts` pure match function (ZIP, category, approval, monthly cap, max 3)
- `src/lib/validation.ts` quote and contractor form rules
- `src/lib/consent.ts` the exact sentences stored on a lead
- `src/lib/email.ts` and `src/lib/webhook.ts` delivery
- `prisma/schema.prisma` users, contractors, leads, assignments, deliveries
- `tests` matching, consent, and validation
