import { supabase } from '../lib/supabase'
import type { AppointmentScheduleView, AppointmentScheduleDraft } from '../types/database.types'

function mapRow(row: any): AppointmentScheduleView {
  return {
    id: row.id,
    type: row.appointment_type,
    date: new Date(row.schedule_date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    capacity: row.capacity,
    booked: 0, // This will be calculated via a join once students start booking
  }
}

export async function fetchSchedules(): Promise<AppointmentScheduleView[]> {
  const { data, error } = await (supabase as any)
    .from('appointment_schedule')
    .select('*')
    .eq('is_deleted', false)
    .order('schedule_date', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

export async function openScheduleDay(draft: AppointmentScheduleDraft): Promise<void> {
  const start = new Date(draft.startDate)
  const end = new Date(draft.endDate)
  const inserts = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    inserts.push({
      appointment_type: draft.type,
      schedule_date: d.toISOString().split('T')[0],
      capacity: draft.capacity,
      is_deleted: false
    })
  }

  if (inserts.length === 0) throw new Error("Invalid date range selected.")

  const { error } = await (supabase as any)
    .from('appointment_schedule')
    .insert(inserts as any)

  if (error) throw new Error(error.message)
}

// 👈 NEW: Function to update the capacity of an existing day
export async function updateScheduleCapacity(scheduleId: string, capacity: number): Promise<void> {
  const { error } = await (supabase as any)
    .from('appointment_schedule')
    .update({ capacity } as any)
    .eq('id', scheduleId)

  if (error) throw new Error(error.message)
}

export async function deleteScheduleDay(scheduleId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('appointment_schedule')
    .update({ is_deleted: true } as any)
    .eq('id', scheduleId)

  if (error) throw new Error(error.message)
}