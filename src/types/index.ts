export type StepStatus = 'pending' | 'in-review' | 'completed'

export type ChecklistStep = {
  id: number
  title: string
  description: string
  status: StepStatus
}

export type AnnouncementPriority = 'High priority' | 'Standard'

export type Announcement = {
  id: number
  title: string
  audience: string
  publishedAt: string
  body: string
  priority: AnnouncementPriority
}

export type AppointmentSlot = {
  id: number
  label: string
  date: string
  time: string
  requirement: string
  booked: number
  capacity: number
}
