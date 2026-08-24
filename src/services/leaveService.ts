import { addDays, addMonths, isPastEntry, todayIso } from '../dateUtils'
import type { LeaveDraft, LeaveEntry } from '../types'
import { createClient } from '@supabase/supabase-js'

const STORAGE_KEY = 'leave-ledger.entries'
const WINDOW_MONTHS = 3
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

type LeaveRow = {
  id: string
  employee_name: string
  start_date: string
  end_date: string
  leave_type: LeaveEntry['leaveType']
  status: LeaveEntry['status']
}

function fromRow(row: LeaveRow): LeaveEntry {
  return { id: row.id, employeeName: row.employee_name, startDate: row.start_date, endDate: row.end_date, leaveType: row.leave_type, status: row.status }
}

function seedEntries(): LeaveEntry[] {
  const today = todayIso()
  return [
    { id: 'seed-1', employeeName: 'Maya Patel', startDate: addDays(today, -18), endDate: addDays(today, -16), leaveType: 'Vacation', status: 'Approved' },
    { id: 'seed-2', employeeName: 'Jordan Lee', startDate: addDays(today, -4), endDate: addDays(today, -3), leaveType: 'Sick', status: 'Approved' },
    { id: 'seed-3', employeeName: 'You', startDate: addDays(today, 4), endDate: addDays(today, 6), leaveType: 'Vacation', status: 'Pending' },
    { id: 'seed-4', employeeName: 'Sam Rivera', startDate: addDays(today, 12), endDate: addDays(today, 12), leaveType: 'Casual', status: 'Approved' },
    { id: 'seed-5', employeeName: 'Aisha Khan', startDate: addDays(today, 31), endDate: addDays(today, 34), leaveType: 'Vacation', status: 'Approved' },
  ]
}

function readEntries(): LeaveEntry[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const initial = seedEntries()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }

  try {
    return JSON.parse(stored) as LeaveEntry[]
  } catch {
    return seedEntries()
  }
}

function writeEntries(entries: LeaveEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function getLocalLeaveEntries(): LeaveEntry[] {
  return readEntries().sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export async function getLeaveEntries(): Promise<LeaveEntry[]> {
  if (!supabase) return getLocalLeaveEntries()
  const { data, error } = await supabase.from('leave_entries').select('id, employee_name, start_date, end_date, leave_type, status').order('start_date')
  if (error) throw new Error(`Could not load shared leave: ${error.message}`)
  return (data as LeaveRow[]).map(fromRow)
}

export function validateDraft(draft: LeaveDraft, today = todayIso()): string {
  const earliest = today
  const latest = addMonths(today, WINDOW_MONTHS)
  if (!draft.employeeName.trim()) return 'Add an employee name.'
  if (!draft.startDate || !draft.endDate) return 'Choose a start and end date.'
  if (draft.startDate > draft.endDate) return 'End date must be on or after the start date.'
  if (draft.startDate < earliest || draft.endDate > latest) return 'Future leave must be within the next three months.'
  return ''
}

export async function saveLeaveEntry(draft: LeaveDraft, entryId?: string): Promise<LeaveEntry> {
  const today = todayIso()
  const error = validateDraft(draft, today)
  if (error) throw new Error(error)

  if (supabase) {
    if (entryId) {
      const { data: existing, error: readError } = await supabase.from('leave_entries').select('id, end_date').eq('id', entryId).single()
      if (readError || !existing) throw new Error('That leave entry no longer exists.')
      if (existing.end_date < today) throw new Error('Past leave is read-only.')
    }
    const row = { employee_name: draft.employeeName.trim(), start_date: draft.startDate, end_date: draft.endDate, leave_type: draft.leaveType, status: draft.status }
    const request = entryId
      ? supabase.from('leave_entries').update(row).eq('id', entryId).select('id, employee_name, start_date, end_date, leave_type, status').single()
      : supabase.from('leave_entries').insert(row).select('id, employee_name, start_date, end_date, leave_type, status').single()
    const { data, error: writeError } = await request
    if (writeError || !data) throw new Error(writeError?.message ?? 'Could not save shared leave.')
    return fromRow(data as LeaveRow)
  }

  const entries = readEntries()
  if (entryId) {
    const existing = entries.find((entry) => entry.id === entryId)
    if (!existing) throw new Error('That leave entry no longer exists.')
    if (isPastEntry(existing, today)) throw new Error('Past leave is read-only.')
  }

  const entry: LeaveEntry = { ...draft, id: entryId ?? crypto.randomUUID() }
  const next = entryId ? entries.map((item) => item.id === entryId ? entry : item) : [...entries, entry]
  writeEntries(next)
  return entry
}

export function exportCsv(entries: LeaveEntry[]): void {
  const header = 'EmployeeName,StartDate,EndDate,LeaveType,Status'
  const rows = entries.map((entry) => [entry.employeeName, entry.startDate, entry.endDate, entry.leaveType, entry.status].map((value) => `"${value.replace(/"/g, '""')}"`).join(','))
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'leave-ledger.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
