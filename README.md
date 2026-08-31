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
  equipment/service history/orders/reminders, browse and subscribe to membership plans. The home
  screen has a Membership & Savings section (Membership Plans — showing membership status and
  renewal date if already a member — Financing, and Rebates) alongside the main action tiles.
  Choosing or switching a membership plan opens a confirmation step showing the plan, price,
  billing cycle, and renewal date before it's submitted, rather than signing up immediately on tap.
- **Technician view**: a mobile-first, one-hand-usable CRM built around the technician's real
  assigned jobs. Today's Jobs / Upcoming with one-tap Start Job, Call, and Directions; a job
  screen surfacing the customer, address, problem, and the property's real equipment (with
  add/edit) without leaving the job; fast quick-select Service Notes, Parts Used, and
  Recommendation (tap tags, no forms); Photos (camera/gallery, auto-attached to the job);
  Create Estimate and Follow-Up straight from the job; Complete Job with a one-tap outcome; My
  Customers search and full Customer History; and an offline queue (IndexedDB) that saves notes,
  photos, and status changes made with poor signal and syncs automatically once back online
- **Admin portal**: log in, dashboard KPIs (including live MRR/ARR from real membership data),
  manage/assign service requests, advance orders, view customers/appointments/products/reminders/
  promotions/technicians, toggle business settings. Built as a desktop two-pane dashboard
  (fixed sidebar + content), but responsive below ~700px width — the sidebar collapses behind a
  menu button and content takes the full screen, so it's usable on an actual phone too. Every
  modal throughout the app (admin CRUD, Property Profile fields, invites, etc.) has an explicit
  ✕ close button, not just tap-the-backdrop.
- **Property Profiles** (Admin Portal → Property Profiles, and linked from a technician's job):
  enter an address and "Find Property" to auto-populate what's genuinely available for free —
  county, lat/long, and normalized address via the US Census Bureau's free geocoder, and flood
  zone via FEMA's public NFHL service. There is no free, unified, nationwide source for
  parcel-level data (square footage, beds/baths, year built, assessed value, tax/sale history,
  zoning, HOA) — those fields correctly show "Not available" until either a paid provider is
  configured (see below) or someone enters them manually. Every field tracks its source, so
  automatic data, a paid provider, and a manual correction never get silently confused, and a
  conflicting value is flagged for the user to resolve rather than overwritten. Includes a Home
  Systems section (HVAC/Plumbing/Electrical/Radon) with a verification tier
  (unknown → inspection → technician-verified) — the same tap-a-field-for-a-bubble-of-common-
  answers pattern from Property Overview/Location also covers every Home System field where a
  common-answer set makes sense (e.g. heating system type, water heater type, panel amperage,
  radon level range), with "Write In Your Own" still available and fields that don't have natural
  common answers (model, serial number, dates) going straight to a text/number/date entry — a
  guided "Start Home Inspection" mode that flags
  a square-footage discrepancy against the record instead of silently replacing it, a property
  history timeline, document uploads, and agent/transaction fields. "Generate PDF" and "Share"
  use the browser's own Print (works normally on the live site — the "print doesn't work" issue
  from the business-plan Artifact was specific to the Artifacts viewer sandbox, not this app) and
  a copy-to-clipboard summary, respectively — there's no page routing in this single-page app to
  support a real shareable link yet. Opening a property from Admin now opens as its own
  full-screen page (no sidebar) rather than the constrained admin content pane.
- **Real Estate Agent submissions**: a technician viewing a Property Profile can tap "📤 Submit
  for Review" to tell the office what a real estate agent needs at that address — Home
  Inspection, HVAC, Electrical, Plumbing, Radon, Water Heater Inspection, Sewer Scope, Move-In
  Safety Check, Maintenance Plan Enrollment, or Other (multi-select), plus optional agent
  name/contact and notes. These land in a separate **Admin Portal → Real Estate** tab (distinct
  from Property Profiles) with a live unreviewed-count badge on the sidebar tab itself, so a new
  submission is never missed among ordinary profile edits.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. No `.env` file is required for Supabase — the project URL and
publishable ("anon") key are already in `src/App.jsx` near the top (`SUPABASE_URL`,
`SUPABASE_ANON_KEY`). The anon key is safe to keep in client code; Row Level Security is what
actually restricts access, not the key itself.

Address autocomplete does need a key: copy `.env.example` to `.env` and set
`VITE_GOOGLE_PLACES_API_KEY` to a Google Cloud API key with the Places API enabled (see "Known
gaps" below). `.env` is gitignored.

## Deploying (GitHub Pages)

A push to `main` (or the active feature branch — see `.github/workflows/deploy.yml`) builds the
app and deploys it to GitHub Pages automatically. One-time setup:

1. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Go to **Settings → Secrets and variables → Actions** and add a repository secret named
   `VITE_GOOGLE_PLACES_API_KEY` with your Places API key (make sure its HTTP referrer
   restriction in Google Cloud Console includes `https://<your-username>.github.io/*`).

The site then publishes to `https://<your-username>.github.io/luxury-comfort-solutions-app/`.

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

1. ~~**Address autocomplete**~~ — done. `google.maps.places.Autocomplete` is wired into the
   `addressLine1` input in the `LoginScreen` component's signup form in `src/App.jsx`; selecting
   a suggestion also fills `city`/`state`/`postalCode`. The key is read from
   `VITE_GOOGLE_PLACES_API_KEY` (a local `.env` file for `npm run dev`, or the
   `VITE_GOOGLE_PLACES_API_KEY` GitHub Actions secret for the Pages deploy — see below) and is
   restricted by HTTP referrer + to the Places API only in Google Cloud Console.
2. **Stripe billing** — membership pricing is illustrative only; no payment is actually processed.
   This needs a secure backend endpoint (e.g. a Supabase Edge Function) holding the Stripe secret
   key — never put a Stripe secret key in this frontend code.
3. ~~**Staff account provisioning**~~ — done. Admins can invite a **technician** (Admin Portal →
   Technicians → "+ Invite Technician") or another **admin** (Admin Portal → Settings →
   Administrators → "+ Invite Admin"). Both call a Supabase Edge Function
   (`invite-technician` / `invite-admin`) that verifies the caller is already an admin, then uses
   the service-role key server-side (never exposed to the frontend) to create the auth account.
   Inviting an admin additionally requires typing an exact confirmation phrase and is written to
   `audit_log`, since it grants full access to everything. A one-time-shown temporary password is
   generated for the admin to hand off to the new user directly.
4. **Push notifications, email/SMS** — not implemented. Would need Firebase Cloud Messaging /
   APNs for push, and a provider like Twilio/SendGrid for SMS/email, triggered from a backend
   (e.g. Supabase Edge Functions responding to database changes).
5. **Native mobile app** — this is a responsive web build. Shipping to the App Store / Google Play
   would mean porting the UI to React Native or Flutter; the Supabase data layer (REST calls in
   `src/App.jsx`) can mostly carry over as-is.
6. ~~**Admin full CRUD**~~ — done. Admins can add/edit/delete across all main data sections
   (customers, technicians, products, promotions, appointments, membership plans, etc.) via a
   config-driven form system (`EntityFormModal`/`ConfirmDeleteModal`/`getEntitySpecs`).
7. ~~**Technician CRM**~~ — done. See "Technician view" above. One deliberate scope cut: adding
   equipment only supports typed fields, not photographing the equipment label — the job's
   general Photos feature covers photo capture, it just isn't linked to a specific equipment row
   yet.
8. ~~**Property Profiles**~~ — done. See "Property Profiles" above. **To activate the paid
   property-data tier** (parcel/APN, sqft, beds/baths, assessed value, tax/sale history, etc. from
   a provider like RentCast or ATTOM): add a `PROPERTY_DATA_API_KEY` secret to the
   `lookup-property` Edge Function in the Supabase dashboard, then fill in the provider's fetch
   call and field mapping in the clearly-marked stub block inside
   `supabase/functions/lookup-property/index.ts` (Edge Functions → lookup-property → Code in the
   dashboard, since this project doesn't check function source into the repo). Nothing else needs
   to change — the frontend, schema, and source-tracking already handle a `paid_api` source.
   There's no "real estate agent" or "homeowner" login in this app — the feature lives in the
   Admin Portal and on the technician's job screen, used by Luxury Comfort Solutions staff working
   with an agent/inspector/homeowner rather than giving them their own account.

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
