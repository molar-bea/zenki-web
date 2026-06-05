import { supabase } from '../lib/supabase'
import type { AppointmentSlot, AppointmentType, AppointmentStatus } from '../types/database.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatType(type: AppointmentType): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Groups raw appointment rows into slot summary cards.
 * Each unique (type + date + time) combination becomes one card showing
 * how many students have booked vs the program's available slots.
 * The admin sees this as their daily headcount dashboard.
 */
function groupIntoSlots(
  rows: Array<{
    id: string
    appointment_type: AppointmentType
    scheduled_date: string
    status: AppointmentStatus
    application: {
      program: { slots_available: number; name: string } | null
    } | null
  }>,
): AppointmentSlot[] {
  const map = new Map<string, AppointmentSlot>()

  for (const row of rows) {
    const dt = new Date(row.scheduled_date)
    const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const key = `${row.appointment_type}|${dateStr}|${timeStr}`

    if (!map.has(key)) {
      map.set(key, {
        id: row.id,
        label: formatType(row.appointment_type),
        date: dateStr,
        time: timeStr,
        requirement: row.application?.program?.name ?? 'General',
        booked: 0,
        capacity: row.application?.program?.slots_available ?? 30,
      })
    }

    // Only count scheduled (not cancelled/completed) toward the headcount
    if (row.status === 'scheduled') {
      map.get(key)!.booked += 1
    }
  }

  return [...map.values()]
}

// ─── Admin use case 3: Manage appointment slots ───────────────────────────────
// The admin's role here is to:
//   a) See the headcount dashboard (who's booked for each day/slot)
//   b) Create official appointment slots that students can then book into
//   c) Cancel or reschedule a slot if needed

/**
 * Fetch the appointment headcount dashboard.
 * Groups all scheduled appointments by (type + date + time) so the admin
 * can see expected foot traffic per slot, per day.
 */
export async function fetchAppointmentSlots(): Promise<AppointmentSlot[]> {
  const { data, error } = await (supabase as any)
    .from('appointment')
    .select(`
      id,
      appointment_type,
      scheduled_date,
      status,
      application (
        program (
          slots_available,
          name
        )
      )
    `)
    .eq('is_deleted', false)
    .in('status', ['scheduled'])
    .order('scheduled_date', { ascending: true })

  if (error) throw new Error(error.message)
  return groupIntoSlots(data ?? [])
}

/**
 * Admin creates an official appointment slot.
 * This creates one appointment row linked to a specific applicant + requirement.
 * The student sees this as a confirmed slot in their itinerary.
 *
 * @param applicationId   – which applicant this slot is for
 * @param appointmentType – e.g. 'campus_visit' | 'medical_exam' | 'document_submission'
 * @param scheduledDate   – the exact datetime of the slot
 */
export async function createAppointmentSlot(params: {
  applicationId: string
  appointmentType: AppointmentType
  scheduledDate: Date
}): Promise<void> {
  const { error } = await (supabase as any).from('appointment').insert({
    application_id: params.applicationId,
    appointment_type: params.appointmentType,
    scheduled_date: params.scheduledDate.toISOString(),
    status: 'scheduled',
    is_deleted: false,
  } as any)

  if (error) throw new Error(error.message)
}

/**
 * Cancel an appointment slot (soft-delete).
 * The slot disappears from the student's itinerary and frees the headcount.
 */
export async function cancelAppointmentSlot(appointmentId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('appointment')
    .update({ is_deleted: true } as any)
    .eq('id', appointmentId)

  if (error) throw new Error(error.message)
}

/**
 * Reschedule an existing appointment to a new datetime.
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newDate: Date,
): Promise<void> {
  const { error } = await (supabase as any)
    .from('appointment')
    .update({ scheduled_date: newDate.toISOString() } as any)
    .eq('id', appointmentId)

  if (error) throw new Error(error.message)
}