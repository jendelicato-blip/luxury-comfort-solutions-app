# Luxury Comfort Solutions — App

A customer app, technician tool, and admin portal for Luxury Comfort Solutions (HVAC, plumbing,
electrical, home inspection, and radon services in Lincoln, NE). Built with React + Vite, backed
by a real Supabase project (Postgres + Auth + Row Level Security).

This code was originally built and tested as a Claude.ai artifact. **It could not actually connect
to Supabase from inside that environment** — Claude.ai artifacts run in a sandboxed iframe whose
Content Security Policy blocks `fetch()` calls to third-party domains. The backend (database,
auth, RLS policies, seed data) is real and already fully set up; this project just needs to run
somewhere without that sandbox restriction — i.e., a real dev server — to actually reach it.

## What's already done (backend, live in Supabase)

- Full Postgres schema: customers, properties, equipment, service requests, appointments, service
  records, orders/products, estimates/invoices, membership plans, reminders, promotions,
  notifications, reviews, attachments, audit log (32 tables total)
- Row Level Security on every table (customers see only their own data; technicians see only jobs
  assigned to them; admins see everything)
- 4 real membership tiers seeded (Essential/Comfort/Complete/Total Home) with monthly + annual
  pricing and included services
- Auth trigger: new customer sign-ups automatically get a `customers` + `properties` +
  `notification_preferences` row
- 3 seed staff accounts for testing (see Credentials below)

## What this frontend does

- **Customer app**: sign up / log in, submit service requests (across 5 service lines), schedule
  appointments, order filters/supplies (no payment — billed to account separately), view
  equipment/service history/orders/reminders, browse and subscribe to membership plans
- **Technician view**: log in, see assigned jobs only, advance job status, add notes
- **Admin portal**: log in, dashboard KPIs (including live MRR/ARR from real membership data),
  manage/assign service requests, advance orders, view customers/appointments/products/reminders/
  promotions/technicians, toggle business settings

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. No `.env` file is required — the Supabase project URL and
publishable ("anon") key are already in `src/App.jsx` near the top (`SUPABASE_URL`,
`SUPABASE_ANON_KEY`). The anon key is safe to keep in client code; Row Level Security is what
actually restricts access, not the key itself.

## Credentials for testing

| Role | Email | Password |
|---|---|---|
| Technician | `mike.ostrander@luxurycomfortsolutions.com` | `TechDemo2026!` |
| Technician | `dana.vance@luxurycomfortsolutions.com` | `TechDemo2026!` |
| Admin | `admin@luxurycomfortsolutions.com` | `AdminDemo2026!` |

For the customer app, use "Create an Account" to sign up as a new customer — this exercises the
real Supabase Auth signup flow and the auto-provisioning trigger.

**Note:** if the Supabase project has email confirmation enabled, a fresh customer sign-up may not
log in immediately — it'll show a "check your email to confirm" message. That's expected Supabase
behavior, not a bug. This can be turned off in the Supabase dashboard (Authentication → Providers →
Email → "Confirm email") for faster local testing.

## Known gaps / next steps

1. **Address autocomplete** — not yet implemented. Recommended approach: Google Places
   Autocomplete API on the sign-up address field. Needs a Google Cloud API key
   (Places API enabled, billing account, key restricted to your domain). Wire it into the
   `addressLine1` input in the `LoginScreen` component's signup form in `src/App.jsx`.
2. **Stripe billing** — membership pricing is illustrative only; no payment is actually processed.
   This needs a secure backend endpoint (e.g. a Supabase Edge Function) holding the Stripe secret
   key — never put a Stripe secret key in this frontend code.
3. **Staff account provisioning** — the 3 seed accounts above were created directly via SQL for
   testing. Real technician/admin account creation should go through a secure server-side flow
   (using Supabase's service-role key, which must never be exposed in frontend code) rather than
   the public sign-up endpoint, so random users can't grant themselves staff access.
4. **Push notifications, email/SMS** — not implemented. Would need Firebase Cloud Messaging /
   APNs for push, and a provider like Twilio/SendGrid for SMS/email, triggered from a backend
   (e.g. Supabase Edge Functions responding to database changes).
5. **Native mobile app** — this is a responsive web build. Shipping to the App Store / Google Play
   would mean porting the UI to React Native or Flutter; the Supabase data layer (REST calls in
   `src/App.jsx`) can mostly carry over as-is.
6. **Admin/technician full CRUD** — some admin actions (creating new products, promotions,
   technicians, editing membership plan pricing) are visible but not yet wired to insert/update
   calls. Pattern to follow is already established in the file (see `assignTechnician`,
   `advanceOrderStatus`, `toggleEmergency` in the `AdminPortal` component).

## Project structure

```
lcs-app/
├── src/
│   ├── App.jsx       ← the entire app (single file, ~2000 lines)
│   └── main.jsx       ← React entry point
├── index.html
├── package.json
└── vite.config.js
```

Everything currently lives in one file (`App.jsx`) since it was built for a single-file artifact
environment. Worth splitting into separate component files as this grows further.

## Supabase project reference

- Project name: "Luxury Comfort Solutions"
- Project ref: `yiceopvfkeezqcvpratd`
- Dashboard: https://supabase.com/dashboard/project/yiceopvfkeezqcvpratd
