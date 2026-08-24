# Leave Ledger

A shared React + TypeScript leave calendar. Authenticated users can add or update future leave information. Past leave remains visible and read-only.

## Run locally

```bash
npm install
npm run dev
```

The current build uses a local storage adapter so the workflow can be previewed without a tenant. Data is stored in the browser under `leave-ledger.entries`.

## Available commands

- `npm run dev` - start the Vite development server
- `npm run build` - run TypeScript and create a production build
- `npm run test` - run validation tests
- `npm run preview` - preview the production build

## Microsoft Graph integration

The next production step is replacing `src/services/leaveService.ts` storage calls with a Graph service using the `LeaveData` worksheet. Configure MSAL with environment values for the tenant, client ID, redirect URI, workbook drive/site ID, workbook item ID, and delegated Graph scopes. Do not commit those values or access tokens.

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
