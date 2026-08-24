export type LeaveType = 'Casual' | 'Sick' | 'Vacation'
export type LeaveStatus = 'Approved' | 'Pending'

export interface LeaveEntry {
  id: string
  employeeName: string
  startDate: string
  endDate: string
  leaveType: LeaveType
  status: LeaveStatus
}

export interface LeaveDraft {
  employeeName: string
  startDate: string
  endDate: string
  leaveType: LeaveType
  status: LeaveStatus
}
