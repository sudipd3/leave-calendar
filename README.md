# Leave Ledger

A shared React + TypeScript leave calendar. Authenticated users can add or update future leave information. Past leave remains visible and read-only.

## Run locally

```bash
npm install
npm run dev
```

The app uses Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. Without them, it falls back to browser storage for local preview. Data is stored in the browser under `leave-ledger.entries` only in fallback mode.

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

## Microsoft Graph integration

The original Excel/Graph plan can still be used, but Supabase is now the recommended shared data backend. Configure MSAL with environment values for the tenant, client ID, redirect URI, workbook drive/site ID, workbook item ID, and delegated Graph scopes only if Excel integration is later required. Do not commit those values or access tokens.

The workbook header row must be:

`EmployeeName, StartDate, EndDate, LeaveType, Status`

A service/API boundary must reject updates to rows whose leave period has ended. Restrict direct workbook access if past-row immutability must be guaranteed outside the application.

## Product rules

- Leave types: Casual, Sick, Vacation.
- Statuses: Pending, Approved.
- Future leave can be created or updated by any authenticated user.
- Past leave can be viewed but not edited or deleted.
- Future dates must be within three calendar months from today.

## Known decisions to confirm

Weekend and holiday handling, overlapping leave, whether statuses are user-editable, and the refresh or change-notification strategy should be agreed before production Graph integration.
