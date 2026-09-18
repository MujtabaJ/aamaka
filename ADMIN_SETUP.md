# AA Maka Production — Admin setup

This document is the operational guide for launching and maintaining the platform.

## 1. Required environment variables

Copy `.env.example` to `.env` (or your host’s secret manager).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma connection string. Local default is SQLite `file:./dev.db`. Production should use PostgreSQL, e.g. `postgresql://user:pass@host:5432/aamaka`. |
| `AUTH_SECRET` | Auth.js session signing secret. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` / `NEXTAUTH_URL` | Public origin, e.g. `https://aamaka.example`. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO, emails and media links. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used **only by `npm run db:seed`** to create the first Super Admin. |
| `STORAGE_DRIVER` | `local` (default) or `s3` when object storage is wired. |
| `STORAGE_LOCAL_DIR` | Local private media directory (`./storage`). |
| `MEDIA_SIGNING_SECRET` | HMAC secret for time-limited media URLs. |
| `MEDIA_URL_TTL` | Signed URL lifetime in seconds (default 300). |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Optional card gateway. Leave empty until ready. |
| `JAZZCASH_*` / `EASYPAISA_*` | Optional Pakistani wallet credentials. |
| `BANK_TRANSFER_INSTRUCTIONS` | Shown at checkout for manual bank payments. |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Transactional email. If unset, emails are logged to the server console. |
| `NOTIFY_ADMIN_EMAIL` | Inbox for admin alerts. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional Google Analytics. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional Meta Pixel. |

Never put payment secrets, SMTP passwords or `AUTH_SECRET` in frontend code.

## 2. Database setup

Local (SQLite, zero extra services):

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

Production (PostgreSQL):

1. Change `provider = "sqlite"` in `prisma/schema.prisma` to `provider = "postgresql"`.
2. Set `DATABASE_URL`.
3. Run `npx prisma migrate dev --name init` (or `prisma migrate deploy` in CI).
4. Run `npm run db:seed` once.

## 3. Admin account creation

The seed command creates:

- Super Admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults in `.env.example`)
- Demo member: `member@aamaka.local` / `Member@12345`
- Demo customer: `customer@aamaka.local` / `Customer@12345`

Change these immediately after first login. Additional staff can be created in **Admin → Users & roles**.

Roles:

- Super Admin — everything, including users, roles, payments and settings
- Admin — catalogue, orders, customers, content (not user/role admin)
- Content Manager — music, articles, homepage, media
- Order Manager — orders, customers, shipping
- Editor — articles and music edits
- Customer — storefront account only

## 4. Storage setup

- Public images live in `public/media/` (covers, product photos, OG images).
- Private full audio/video live in `storage/private/` and are **never** linked directly.
- Playback goes through `/api/media/play` → signed `/api/media/stream`.
- Full-file streaming re-checks membership or purchase on the server.

To use S3 later, keep `STORAGE_DRIVER=s3` and implement the same `storageKey` contract already stored on `MediaAsset`. Do not store large media in the database.

## 5. Payment configuration

Working without a card processor:

- **Cash on delivery** for physical products
- **Bank transfer** for digital albums, memberships and mixed carts

These create real orders with `payment_pending`. Admin marks them **paid** to grant album entitlements and memberships (`fulfillOrder`).

Card / JazzCash / Easypaisa:

- Architecture is modular in `src/lib/payments.ts`
- Checkout **will not fake a successful card charge**
- If keys are missing, the method is disabled or returns a configuration error
- Webhooks: `POST /api/payments/webhook` (requires a webhook secret)

Never store raw card numbers.

## 6. Email configuration

Reusable templates live in `src/lib/notifications.ts`:

- Welcome, order confirmation, payment, shipped, delivered
- Subscription activated / expiring
- Admin: new order, new customer, newsletter, contact, low stock

Without SMTP, messages are stored as in-app notifications and printed to the console. Connect SMTP or a provider (SES, Postmark, Resend) in `deliverEmail` without changing callers.

## 7. Deployment

1. Node 20+.
2. Set production env vars, especially `AUTH_SECRET`, `MEDIA_SIGNING_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`.
3. `npm ci`
4. `npx prisma migrate deploy` (Postgres) or `db push` (carefully, SQLite only for demos)
5. `npm run build`
6. `npm start`
7. Point the process manager / host at port 3000 (or `PORT`).

Suggested hosts: Vercel (serverless + Postgres), a VPS with systemd, or Docker.

Private media on serverless hosts should use object storage, not the local disk.

## 8. Production security checklist

- [ ] Replace seed admin password
- [ ] Rotate `AUTH_SECRET` and `MEDIA_SIGNING_SECRET`
- [ ] Use HTTPS everywhere
- [ ] Use PostgreSQL with restricted DB users
- [ ] Disable directory listing on `storage/`
- [ ] Confirm full media is not in `public/`
- [ ] Configure SMTP
- [ ] Configure a real payment webhook secret before enabling cards
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the canonical domain
- [ ] Restrict `/admin` to staff (middleware + RBAC already in place)
- [ ] Back up the database and private media
- [ ] Review audit logs after staff onboarding
- [ ] Add a WAF / rate-limit at the edge for login and checkout
- [ ] Keep copyright/license fields filled for every premium upload

## 9. Content rights

Only upload audio/video AA Maka Production owns or is licensed to distribute. Social fields should link to official YouTube / Facebook / TikTok / Instagram URLs. The seed catalogue uses **original placeholder recordings and artwork**, not third-party media files.
