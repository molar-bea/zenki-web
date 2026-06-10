import { supabase } from '../lib/supabase'
import type { AppointmentScheduleView, AppointmentScheduleDraft } from '../types/database.types'

export async function fetchSchedules(): Promise<AppointmentScheduleView[]> {
  // 1. Fetch all active schedules
  const { data: schedules, error: scheduleError } = await (supabase as any)
    .from('appointment_schedule')
    .select('*')
    .eq('is_deleted', false)
    .order('schedule_date', { ascending: true })

  if (scheduleError) throw new Error(scheduleError.message)

  // 2. Fetch all active student bookings (excluding cancelled ones)
  const { data: bookings, error: bookingsError } = await (supabase as any)
    .from('appointment')
    .select('schedule_id')
    .eq('is_deleted', false)
    .neq('status', 'cancelled')

  if (bookingsError) throw new Error(bookingsError.message)

  // 3. Count how many bookings exist for each schedule ID
  const bookingCounts = (bookings ?? []).reduce((acc: Record<string, number>, curr: any) => {
    const sid = curr.schedule_id;
    if (sid) {
      acc[sid] = (acc[sid] || 0) + 1;
    }
    return acc;
  }, {});

  // 4. Map the rows and inject the live count
  return (schedules ?? []).map((row: any) => ({
    id: row.id,
    type: row.appointment_type,
    date: new Date(row.schedule_date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    capacity: row.capacity,
    booked: bookingCounts[row.id] || 0, // Automatically defaults to 0 if no one booked yet
  }))
}

// ... keep your other functions (openScheduleDay, updateScheduleCapacity, etc.) below exactly as they are ...

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