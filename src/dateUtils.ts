const DAY_MS = 24 * 60 * 60 * 1000

export function toDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

export function addDays(isoDate: string, amount: number): string {
  const date = toDate(isoDate)
  date.setDate(date.getDate() + amount)
  return toIsoDate(date)
}

export function addMonths(isoDate: string, amount: number): string {
  const date = toDate(isoDate)
  date.setMonth(date.getMonth() + amount)
  return toIsoDate(date)
}

export function formatDate(isoDate: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en', options ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(toDate(isoDate))
}

export function monthLabel(month: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(month)
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function daysBetweenInclusive(startDate: string, endDate: string): number {
  return Math.round((toDate(endDate).getTime() - toDate(startDate).getTime()) / DAY_MS) + 1
}

export function dateIsWithinEntry(date: string, entry: { startDate: string; endDate: string }): boolean {
  return date >= entry.startDate && date <= entry.endDate
}

export function isPastEntry(entry: { endDate: string }, today = todayIso()): boolean {
  return entry.endDate < today
}

export function getCalendarDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const mondayOffset = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - mondayOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}
