import { describe, expect, it } from 'vitest'
import { addDays, addMonths } from '../src/dateUtils'
import { validateDraft } from '../src/services/leaveService'
import type { LeaveDraft } from '../src/types'

const today = '2026-08-24'
const draft: LeaveDraft = { employeeName: 'You', startDate: '2026-08-25', endDate: '2026-08-27', leaveType: 'Vacation', status: 'Pending' }

describe('leave validation', () => {
  it('accepts a future entry inside the three-month window', () => {
    expect(validateDraft(draft, today)).toBe('')
  })

  it('rejects leave that starts in the past', () => {
    expect(validateDraft({ ...draft, startDate: addDays(today, -1) }, today)).toContain('next three months')
  })

  it('rejects leave beyond the three-month window', () => {
    expect(validateDraft({ ...draft, startDate: addMonths(today, 3), endDate: addMonths(today, 3 + 1) }, today)).toContain('next three months')
  })

  it('rejects a reversed date range', () => {
    expect(validateDraft({ ...draft, startDate: '2026-09-04', endDate: '2026-09-02' }, today)).toContain('on or after')
  })

  it('requires an employee name', () => {
    expect(validateDraft({ ...draft, employeeName: ' ' }, today)).toContain('employee name')
  })
})
