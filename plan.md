# Leave Ledger Plan

## Phase 1: Runnable information calendar

- [x] Scaffold React and TypeScript application.
- [x] Display a monthly calendar with color-coded leave types.
- [x] Show past and future leave history with employee filtering.
- [x] Allow shared editing of future leave only.
- [x] Add CSV export and local preview storage.

## Phase 2: Microsoft 365 integration

- [ ] Configure MSAL login and protected routes.
- [ ] Add a Graph Excel service for the `LeaveData` worksheet.
- [ ] Verify or initialize workbook headers.
- [ ] Replace local storage with Graph reads and writes.
- [ ] Add refresh-before-write and conflict messaging.

## Phase 3: Production readiness

- [ ] Confirm weekend, holiday, overlap, status, and timezone policies.
- [ ] Add accessible browser workflow tests.
- [ ] Add Excel/PDF report generation.
- [ ] Configure Azure deployment and environment variables.
- [ ] Restrict direct workbook editing if immutable past data is required.
