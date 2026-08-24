# Leave Ledger Test Plan

## Automated

- Validate future dates, three-month boundaries, missing names, and reversed ranges.
- Verify past rows are rejected by the write service.
- Verify calendar entries render across every covered date.
- Verify filtering and CSV export use the visible shared records.
- Mock Microsoft Graph at the service boundary when integration is added.

## Manual acceptance

- Sign in and confirm unauthenticated users cannot reach the calendar.
- Add a future entry and confirm it appears in the calendar and history.
- Edit a future entry from both the calendar and history.
- Confirm past entries show no edit control and stale past updates fail safely.
- Check keyboard access, responsive layout, loading/error states, and export download.
