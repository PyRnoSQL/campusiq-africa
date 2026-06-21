# CampusIQ Africa

Offline-first Progressive Web App for administering Schools and Universities (General, Technical/Vocational, Higher Ed) across Africa. Single combined service (React PWA frontend + Express API backend) deployed on Railway, with Google Sheets as the live data backend. Multilingual: French / English / Spanish / Arabic (full RTL).

## Why this architecture

- **One Railway service** — the Express server serves both the JSON API (`/api/*`) and the built React app (`/`), so there's nothing extra to host or wire together.
- **Google Sheets as the database** — every "table" is a tab in one spreadsheet. Zero database ops, your school admins can audit/export raw data anytime, and a non-technical ministry official can open the same spreadsheet in a browser.
- **Offline-first PWA** — a service worker caches the app shell + last-seen data; an IndexedDB queue captures every create/update made while offline (e.g. a teacher taking attendance in a village with no signal) and auto-syncs to `/api/sync` the moment connectivity returns.

## Key features

- **Multi-tenant**: any number of institutions (schools/universities) in one deployment, each scoped by `institution_id`. A `SuperAdmin` role sees everything; `InstitutionAdmin`/`Teacher`/`Parent` roles are scoped to their own institution.
- **Modules**: Students, Staff, Classes & Programs, Attendance, Grades & Assessments, Fees & Finance, Admissions, Certificates/Documents, Announcements, Analytics.
- **Early-warning analytics**: a transparent, rule-based "at-risk student" detector (low attendance and/or low grades) — explainable, no ML infrastructure needed for v1, upgradeable later.
- **Offline sync indicator**: a live pulse showing online/offline state and pending changes, with one-tap manual sync.
- **i18n with RTL**: FR/EN/SP/AR, instant language switching, Arabic flips the whole layout to right-to-left.
- **Audit log**: every create/update/delete is recorded (who, what, when, online or offline-synced, device).
- **Soft deletes**: records are deactivated, not destroyed — full audit trail preserved.

## Repository layout

```
campusiq-africa/
├── server/                 # Express API (also serves the built client)
│   ├── src/
│   │   ├── config/          # Google Sheets auth + schema definition
│   │   ├── services/        # Generic Sheets CRUD + audit log
│   │   ├── middleware/      # JWT auth, role + institution scoping
│   │   ├── routes/          # auth, institutions, sync, analytics, and all modules
│   │   └── utils/           # CRUD route factory
│   └── scripts/setupSheets.js   # One-time: creates all tabs + sample data
├── client/                 # React + Vite PWA
│   └── src/
│       ├── i18n/             # en.json, fr.json, es.json, ar.json
│       ├── offline/           # IndexedDB cache + sync queue engine
│       ├── api/                # Network-first/offline-fallback API client
│       ├── pages/, components/, context/, hooks/
└── railway.json / nixpacks.toml
```

## 1. Set up Google Sheets

1. In Google Cloud Console, create a project (or reuse one) and enable the **Google Sheets API**.
2. Create a **Service Account**, then generate a JSON key for it.
3. Create a new, blank Google Sheet. Share it with the service account's email (found in the JSON key as `client_email`) as **Editor**.
4. Copy the spreadsheet ID from its URL: `https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit`.

## 2. Configure environment variables

Copy `server/.env.example` to `server/.env` and fill in:

```
GOOGLE_SHEET_ID=<your spreadsheet id>
GOOGLE_SERVICE_ACCOUNT_JSON=<paste the whole key file content — base64-encode it for Railway>
JWT_SECRET=<a long random string>
```

To base64-encode the key file (recommended for pasting into Railway's env var UI):

```bash
base64 -w0 path/to/service-account.json
```

## 3. Seed the spreadsheet with all tabs + sample data

```bash
npm run install:all
npm run setup:sheets
```

This creates every tab (Institutions, Users, Students, Staff, Classes_Programs, Attendance, Grades_Assessments, Finance_Fees, Admissions, Certificates_Documents, Announcements_Notifications, AuditLog, Settings), writes headers, freezes/styles the header row, and seeds realistic sample rows across 5 sample institutions (Cameroon, Ghana, Senegal, Equatorial Guinea, Egypt) covering all three institution types.

All sample user accounts share the demo password printed at the end of the script (default `Campus2026!`). Example login: `admin@campusiq.africa`.

## 4. Run locally

```bash
# Terminal 1
npm run dev:server     # http://localhost:8080

# Terminal 2
npm run dev:client     # http://localhost:5173 (proxies /api to :8080)
```

## 5. Deploy to Railway (single service)

1. Push this repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo**.
3. Railway auto-detects `nixpacks.toml` / `railway.json`: build runs `npm run build` (builds the client into `client/dist` and installs server deps), start runs `npm run start` (Express serves the API and the built client).
4. Add environment variables in Railway's dashboard: `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `JWT_SECRET`, `NODE_ENV=production`.
5. Deploy. Railway gives you a public URL — that's your whole app, frontend and backend, on one service.

## Roles

| Role | Scope |
|---|---|
| `SuperAdmin` | All institutions, all data, can create institutions |
| `InstitutionAdmin` | Full read/write within their own institution |
| `Teacher` | Read within their institution; write Students/Attendance/Grades/Announcements |
| `Parent` | Read-only, scoped to their own children (extend `findAll` filters as needed) |
| `Student` | Read-only, scoped to self (extend as needed) |

## Extending further (suggested next steps)

- Replace the rule-based risk model in `analytics.js` with a trained classifier once you have enough historical data (the API surface stays identical).
- Add SMS/WhatsApp delivery for `Announcements_Notifications` (e.g. via Africa's Talking or Twilio) for guardians without smartphones.
- Add a `Sheets → BigQuery` Connected Sheets pipeline later (same evolution path used in BankPulse360/NEXUS360) once data volume outgrows Sheets API quotas — no frontend changes required.
- Generate PDF report cards/transcripts/certificates server-side from `Grades_Assessments` and `Certificates_Documents`.
