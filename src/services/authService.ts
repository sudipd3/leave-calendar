export type UserRole = 'Approver' | 'Leave-Taker'

export interface AppUser {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  active: boolean
}

const USERS_KEY = 'leave-ledger.users'
const SESSION_KEY = 'leave-ledger.session'

const defaultUsers: AppUser[] = [
  { id: 'approver-1', name: 'Alex Morgan', email: 'approver@leaveledger.local', password: 'approver123', role: 'Approver', active: true },
  { id: 'taker-1', name: 'You', email: 'you@leaveledger.local', password: 'leave123', role: 'Leave-Taker', active: true },
]

function readUsers(): AppUser[] {
  const stored = localStorage.getItem(USERS_KEY)
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))
    return defaultUsers
  }
  try {
    return JSON.parse(stored) as AppUser[]
  } catch {
    return defaultUsers
  }
}

function writeUsers(users: AppUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getUsers(): AppUser[] {
  return readUsers()
}

export function getSession(): AppUser | null {
  const sessionId = localStorage.getItem(SESSION_KEY)
  return readUsers().find((user) => user.id === sessionId && user.active) ?? null
}

export function login(email: string, password: string): AppUser {
  const user = readUsers().find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password && candidate.active)
  if (!user) throw new Error('Email or password is incorrect.')
  localStorage.setItem(SESSION_KEY, user.id)
  return user
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function addUser(name: string, email: string, role: UserRole): AppUser {
  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanName || !cleanEmail) throw new Error('Name and email are required.')
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error('Enter a valid email address.')
  const users = readUsers()
  if (users.some((user) => user.email === cleanEmail)) throw new Error('A user with that email already exists.')
  const temporaryPassword = role === 'Approver' ? 'approver123' : 'leave123'
  const user: AppUser = { id: crypto.randomUUID(), name: cleanName, email: cleanEmail, password: temporaryPassword, role, active: true }
  writeUsers([...users, user])
  return user
}
