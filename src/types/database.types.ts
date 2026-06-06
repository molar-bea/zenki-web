// ─── DB enums — must match your Supabase enum names exactly ──────────────────

export type UserRole          = 'admin' | 'student' | 'staff'
export type AppointmentType   = 'campus_visit' | 'interview' | 'document_submission'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

// Keep these for completeness (used by student-side tables in the same DB)
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected'
export type ChecklistStatus   = 'pending' | 'in_review' | 'completed'

// ─── DB table row types (mirrors the schema image exactly) ───────────────────

export interface User {
  id: string
  full_name: string
  email: string
  password_hash: string
  phone_number: string | null
  role: UserRole
  is_deleted: boolean
  created_at: string
}

export interface Requirement {
  id: string
  user_id: string | null
  name: string
  description: string | null
  start_date: string | null  
  end_date: string | null
  is_mandatory: boolean
  is_deleted: boolean
  created_at: string
  step_order: number
}

export interface Announcement {
  id: string
  user_id: string       // admin who published it
  title: string
  body: string
  priority: 'High priority' | 'Standard'
  is_deleted: boolean
  created_at: string
}

export interface Appointment {
  id: string
  application_id: string
  appointment_type: AppointmentType
  scheduled_date: string
  status: AppointmentStatus
  is_deleted: boolean
  created_at: string
}

// ─── Supabase typed client map ────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      user: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      requirement: {
        Row: Requirement
        Insert: Omit<Requirement, 'id' | 'created_at'>
        Update: Partial<Omit<Requirement, 'id' | 'created_at'>>
      }
      announcement: {
        Row: Announcement
        Insert: Omit<Announcement, 'id' | 'created_at'>
        Update: Partial<Omit<Announcement, 'id' | 'created_at'>>
      }
      appointment: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at'>>
      }
    }
    Enums: {
      user_role_enum:          UserRole
      appointment_type_enum:   AppointmentType
      appointment_status_enum: AppointmentStatus
    }
  }
}

// ─── Frontend view types (what Vue components actually receive as props) ───────

/**
 * Use case 1 — Checklist step as shown in ChecklistPage.
 * Admin perspective: a step is a template definition, not a progress record.
 * Status here is always 'pending' from the admin's view — students track their own progress.
 */
export interface ChecklistStep {
  id: string
  title: string
  description: string
  startDate: string | null
  endDate: string | null
  is_mandatory: boolean
  step_order: number
  status: 'pending' | 'in-review' | 'completed'
}

/**
 * Use case 2 — Announcement as shown in AnnouncementsPage and OverviewPage feed.
 */
export interface AnnouncementView {
  id: string
  title: string
  body: string
  priority: 'High priority' | 'Standard'
  is_pinned: boolean
  publishedAt: string
}

/**
 * Use case 2 — Draft form bound to the compose panel on AnnouncementsPage.
 */
export interface AnnouncementDraft {
  title: string
  body: string
  priority: 'High priority' | 'Standard'
}

/**
 * Use case 3 — Appointment slot card as shown in AppointmentsPage.
 * Represents a grouped headcount: one slot type + date + time = one card.
 * booked = how many students have this slot scheduled.
 */
export type AdminAppointmentType = 'Medical Appointment' | 'Document Submission'

export interface AppointmentScheduleDraft {
  type: AdminAppointmentType
  startDate: string 
  endDate: string   
  capacity: number
}

export interface AppointmentScheduleView {
  id: string
  type: AdminAppointmentType
  date: string
  capacity: number
  booked: number
}