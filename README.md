# AA Maka Production

Premium Sindhi music, culture and commerce platform for **AA Maka Production / AA Production**.

This is a full-stack Next.js application: public website, customer accounts, memberships, music library, cultural shop, and an admin dashboard.

## Quick start

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Seeded accounts (change immediately in production):

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@aamaka.local` | `ChangeMe_Admin_123!` |
| Member | `member@aamaka.local` | `Member@12345` |
| Customer | `customer@aamaka.local` | `Customer@12345` |

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for environment variables, storage, payments, email, deployment and the production security checklist.
# aamaka
