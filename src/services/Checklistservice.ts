import { supabase } from '../lib/supabase'
import type { ChecklistStep } from '../types/database.types'

function mapRow(row: any): ChecklistStep {
  return {
    id: row.id,
    title: row.name,
    description: row.description ?? '',
    startDate: row.start_date,
    endDate: row.end_date,
    is_mandatory: row.is_mandatory,
    step_order: row.step_order,
    status: 'pending',
  }
}

export async function fetchChecklistSteps(): Promise<ChecklistStep[]> {
  const { data, error } = await (supabase as any)
    .from('requirement')
    .select('id, name, description, start_date, end_date, step_order,is_mandatory')
    .eq('is_deleted', false)
    .order('step_order', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

export async function addChecklistStep(params: {
  name: string
  description?: string
  startDate?: string
  endDate?: string
  stepOrder: number
  is_mandatory: boolean
}): Promise<ChecklistStep> {
  const { data, error } = await (supabase as any)
    .from('requirement')
    .insert({
      name: params.name,
      description: params.description ?? null,
      start_date: params.startDate ?? null,
      end_date: params.endDate ?? null,
      step_order: params.stepOrder,
      is_mandatory: params.is_mandatory,
      is_deleted: false,
    } as any)
    .select('id, name, description, start_date, end_date, step_order, is_mandatory')
    .single()

  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function updateChecklistStep(params: {
  requirementId: string
  name?: string
  description?: string
  startDate?: string
  is_mandatory?: boolean
  endDate?: string
}): Promise<void> {
  const { error } = await (supabase as any)
    .from('requirement')
    .update({
      ...(params.name !== undefined && { name: params.name }),
      ...(params.description !== undefined && { description: params.description }),
      ...(params.startDate !== undefined && { start_date: params.startDate }),
      ...(params.endDate !== undefined && { end_date: params.endDate }),
      ...(params.is_mandatory !== undefined && { is_mandatory: params.is_mandatory }),
    } as any)
    .eq('id', params.requirementId)

  if (error) throw new Error(error.message)
}

export async function deleteChecklistStep(requirementId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('requirement')
    .update({ is_deleted: true } as any)
    .eq('id', requirementId)

  if (error) throw new Error(error.message)
}


export async function reorderChecklistSteps(steps: Array<{ id: string; step_order: number }>): Promise<void> {
  const updates = steps.map(({ id, step_order }) =>
    (supabase as any).from('requirement').update({ step_order } as Partial<ChecklistStep>).eq('id', id)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}
