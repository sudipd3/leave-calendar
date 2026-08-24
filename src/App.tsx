import { useMemo, useState } from 'react'
import { addMonths, dateIsWithinEntry, formatDate, getCalendarDays, isPastEntry, monthLabel, todayIso } from './dateUtils'
import { exportCsv, getLeaveEntries, saveLeaveEntry } from './services/leaveService'
import type { LeaveDraft, LeaveEntry, LeaveType } from './types'

const leaveTypes: LeaveType[] = ['Vacation', 'Casual', 'Sick']
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const initialDraft: LeaveDraft = {
  employeeName: 'You',
  startDate: addMonths(todayIso(), 0),
  endDate: addMonths(todayIso(), 0),
  leaveType: 'Vacation',
  status: 'Pending',
}

function App() {
  const [entries, setEntries] = useState<LeaveEntry[]>(getLeaveEntries)
  const [activeMonth, setActiveMonth] = useState(() => new Date())
  const [draft, setDraft] = useState<LeaveDraft>(initialDraft)
  const [editingId, setEditingId] = useState<string>()
  const [filter, setFilter] = useState('All people')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const today = todayIso()

  const people = useMemo(() => ['All people', ...Array.from(new Set(entries.map((entry) => entry.employeeName))).sort()], [entries])
  const visibleEntries = useMemo(() => filter === 'All people' ? entries : entries.filter((entry) => entry.employeeName === filter), [entries, filter])
  const calendarDays = useMemo(() => getCalendarDays(activeMonth), [activeMonth])
  const upcomingCount = entries.filter((entry) => !isPastEntry(entry, today)).length
  const activeDays = entries.filter((entry) => !isPastEntry(entry, today)).reduce((total, entry) => {
    const start = entry.startDate < today ? today : entry.startDate
    return total + Math.max(0, Math.round((new Date(`${entry.endDate}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) / 86400000) + 1)
  }, 0)

  function updateDraft(field: keyof LeaveDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    setError('')
    setNotice('')
  }

  function submitLeave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      saveLeaveEntry(draft, editingId)
      setEntries(getLeaveEntries())
      setDraft(initialDraft)
      setEditingId(undefined)
      setNotice(editingId ? 'Leave entry updated for everyone.' : 'Leave entry added to the shared calendar.')
      setError('')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to save leave.')
      setNotice('')
    }
  }

  function startEditing(entry: LeaveEntry) {
    setEditingId(entry.id)
    setDraft({ employeeName: entry.employeeName, startDate: entry.startDate, endDate: entry.endDate, leaveType: entry.leaveType, status: entry.status })
    setNotice('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditing() {
    setEditingId(undefined)
    setDraft(initialDraft)
    setError('')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">LL</span>
          <div>
            <p className="eyebrow">Shared workplace calendar</p>
            <h1>Leave Ledger</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="sync-state"><span className="live-dot" /> Local preview</span>
          <button className="outline-button" type="button" onClick={() => exportCsv(visibleEntries)}>Export CSV</button>
          <div className="avatar" aria-label="Signed in as You">Y</div>
        </div>
      </header>

      <section className="intro-row">
        <div>
          <p className="eyebrow">Monday, 24 August 2026</p>
          <h2>Know who is away.</h2>
          <p className="intro-copy">A clear view of the next few months, kept current by the whole team.</p>
        </div>
        <div className="summary-strip" aria-label="Leave summary">
          <div><strong>{upcomingCount}</strong><span>upcoming entries</span></div>
          <div><strong>{activeDays}</strong><span>days planned</span></div>
          <div><strong>{entries.length}</strong><span>total records</span></div>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="calendar-panel panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Team overview</p>
              <h3>{monthLabel(activeMonth)}</h3>
            </div>
            <div className="month-controls">
              <button type="button" aria-label="Previous month" onClick={() => setActiveMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Prev</button>
              <button type="button" aria-label="Go to current month" onClick={() => setActiveMonth(new Date())}>Today</button>
              <button type="button" aria-label="Next month" onClick={() => setActiveMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</button>
            </div>
          </div>
          <div className="calendar-grid calendar-headings">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid calendar-body">
            {calendarDays.map((day) => {
              const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
              const dayEntries = visibleEntries.filter((entry) => dateIsWithinEntry(date, entry))
              const isToday = date === today
              const inMonth = day.getMonth() === activeMonth.getMonth()
              return <div className={`calendar-cell${inMonth ? '' : ' outside-month'}${isToday ? ' today' : ''}`} key={date}>
                <span className="day-number">{day.getDate()}</span>
                {dayEntries.map((entry) => <button key={entry.id} type="button" className={`leave-chip ${entry.leaveType.toLowerCase()}`} onClick={() => !isPastEntry(entry, today) && startEditing(entry)} title={isPastEntry(entry, today) ? 'Past leave is read-only' : `Edit ${entry.employeeName}'s leave`}>
                  <span>{entry.employeeName}</span><small>{entry.leaveType}</small>
                </button>)}
              </div>
            })}
          </div>
          <div className="legend"><span><i className="legend-swatch vacation" />Vacation</span><span><i className="legend-swatch casual" />Casual</span><span><i className="legend-swatch sick" />Sick</span><span className="read-only-note">Past entries are read-only</span></div>
        </div>

        <aside className="side-column">
          <section className="panel form-panel">
            <div className="panel-heading compact-heading">
              <div><p className="eyebrow">Shared editing</p><h3>{editingId ? 'Edit future leave' : 'Add future leave'}</h3></div>
              {editingId && <button className="text-button" type="button" onClick={cancelEditing}>Cancel</button>}
            </div>
            <p className="form-note">Everyone can keep future plans current. Past leave stays locked.</p>
            <form onSubmit={submitLeave}>
              <label>Employee name<input value={draft.employeeName} onChange={(event) => updateDraft('employeeName', event.target.value)} placeholder="e.g. Maya Patel" /></label>
              <div className="date-row"><label>Starts<input type="date" min={today} max={addMonths(today, 3)} value={draft.startDate} onChange={(event) => updateDraft('startDate', event.target.value)} /></label><label>Ends<input type="date" min={today} max={addMonths(today, 3)} value={draft.endDate} onChange={(event) => updateDraft('endDate', event.target.value)} /></label></div>
              <label>Leave type<select value={draft.leaveType} onChange={(event) => updateDraft('leaveType', event.target.value)}>{leaveTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label>Status<select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}><option>Pending</option><option>Approved</option></select></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              {notice && <p className="form-success" role="status">{notice}</p>}
              <button className="primary-button" type="submit">{editingId ? 'Save changes' : 'Add to calendar'}</button>
            </form>
          </section>

          <section className="panel history-panel">
            <div className="panel-heading compact-heading"><div><p className="eyebrow">Record book</p><h3>Leave history</h3></div><select className="filter-select" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by employee">{people.map((person) => <option key={person}>{person}</option>)}</select></div>
            <div className="history-list">{visibleEntries.map((entry) => <article className={`history-item${isPastEntry(entry, today) ? ' is-past' : ''}`} key={entry.id}><div className={`type-bar ${entry.leaveType.toLowerCase()}`} /><div className="history-details"><strong>{entry.employeeName}</strong><span>{formatDate(entry.startDate, { month: 'short', day: 'numeric' })} - {formatDate(entry.endDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><div className="history-meta"><span className={`status ${entry.status.toLowerCase()}`}>{entry.status}</span>{isPastEntry(entry, today) ? <span className="locked">Read-only</span> : <button className="edit-button" type="button" onClick={() => startEditing(entry)}>Edit</button>}</div></article>)}</div>
          </section>
        </aside>
      </section>
      <footer><span>Leave Ledger</span><span>Shared information, one source of truth</span></footer>
    </main>
  )
}

export default App
