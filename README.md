# Smart Factory

Next.js app with Supabase and Google Sheets master data integration.

## Connect Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Create a local env file:

```bash
cp .env.example .env.local
```

4. Paste your values into `.env.local`.
5. Start the dev server:

```bash
npm install
npm run dev
```

6. Verify the connection:

```bash
curl http://localhost:3000/api/supabase/health
```

You should see `{ "connected": true, "status": "ok", ... }`.

## Google Sheets master (employees)

The app reads employee master data from this shared Google Sheet:

https://docs.google.com/spreadsheets/d/1BRk-wf2VLcCSaFTpXcTAN7FD6KLcoJq1iIzybWcvqQo/edit

Columns: `employee_ID`, `prefix`, `first_Name`, `last_Name`, `position`, `level`, `department`

Verify the connection:

```bash
curl http://localhost:3000/api/google-sheets/health
curl "http://localhost:3000/api/master/employees?limit=5"
```

## Automatic setup (recommended)

You already connected Supabase with URL + anon key. That is enough for the app to **read/write data only after tables exist**, but it cannot create tables by itself.

To let the AI run everything automatically, add these two server-only keys to `.env.local`:

| Key | Where to get it |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API → `service_role` |

Then run:

```bash
npm run setup:master
```

This command will automatically:

1. Create `master.users` in Supabase
2. Import 309 employees from Google Sheets
3. Verify the connection

No copy/paste into SQL Editor is needed after these keys are added.

### Even more automatic

Connect **Supabase MCP** in Cursor settings, or add the keys as Cloud Agent secrets. Then the AI can run `npm run setup:master` for you without manual dashboard steps.

## Manual setup (fallback)

Optional: sync master data into Supabase `master.users`

1. Open **Supabase SQL Editor** and run the full script in `supabase/sql/master_users.sql`.
2. Open **Project Settings → API → Exposed schemas** and add `master`.
3. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
4. Trigger sync:

```bash
curl -X POST http://localhost:3000/api/master/employees/sync
curl http://localhost:3000/api/master/users?limit=5
```

## What's included

- Supabase SSR clients and session refresh middleware
- Google Sheets CSV import for employee master data
- Health checks at `/api/supabase/health` and `/api/google-sheets/health`
- Employee API at `/api/master/employees`

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only admin key for master sync |
| `GOOGLE_SHEETS_MASTER_EMPLOYEES_ID` | No | Google Sheet ID (defaults to shared master sheet) |
| `GOOGLE_SHEETS_MASTER_EMPLOYEES_GID` | No | Sheet tab gid (default `0`) |

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run ESLint
