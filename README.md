# Leave Ledger

A shared React + TypeScript leave calendar. Authenticated users can add or update future leave information. Past leave remains visible and read-only.

## Run locally

```bash
npm install
npm run dev
```

The app uses Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. Without them, it falls back to browser storage for local preview. Data is stored in the browser under `leave-ledger.entries` only in fallback mode.

## Local demo login

- Approver: `approver@leaveledger.local` / `approver123`
- Leave-Taker: `you@leaveledger.local` / `leave123`

The Approver sees the **Add user** panel. New local users receive `leave123` for Leave-Taker or `approver123` for Approver. This demo authentication is stored in browser storage and is not suitable for production; replace it with MSAL or Supabase Auth before deployment.

Approvers can remove individual records and clear all past history. These actions are protected by the local demo role only; before production, replace the public Supabase delete policy with an authenticated Approver policy.

## Supabase setup

1. Create a free Supabase project.
2. Open the Supabase SQL Editor and run `supabase/schema.sql`.
3. Copy the project URL and anon key into a local `.env` file using `.env.example`.
4. Run `npm run dev` and open the app. All configured users will read and write the same database records.

The starter SQL policies allow public calendar access because this MVP has no login screen. Add Supabase Auth or MSAL and tighten the policies before using the app for sensitive workplace data.

## Available commands

- `npm run dev` - start the Vite development server
- `npm run build` - run TypeScript and create a production build
- `npm run test` - run validation tests
- `npm run preview` - preview the production build
