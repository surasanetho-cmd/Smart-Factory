# Smart Factory

Next.js app with Supabase Auth and database integration.

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

## What's included

- `@supabase/supabase-js` and `@supabase/ssr` for browser, server, and middleware clients
- Session refresh middleware in `src/middleware.ts`
- Health check route at `/api/supabase/health`

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only admin key — never expose to the client |

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run ESLint
