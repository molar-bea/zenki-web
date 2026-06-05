import { supabase } from '../lib/supabase'
import type { AnnouncementView, AnnouncementDraft } from '../types/database.types'

// Helpers
function mapRow(row: any): AnnouncementView {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    priority: row.priority,
    is_pinned: row.is_pinned ?? false,
    publishedAt: new Date(row.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

export async function fetchAnnouncements(): Promise<AnnouncementView[]> {
  const { data, error } = await (supabase as any)
    .from('announcement')
    .select('id, title, body, priority, created_at, is_pinned')
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false }) // Pinned stays at top
    .order('created_at', { ascending: false }) // Then sort newest first
    .limit(5) // Limit feed strictly to 5

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

export async function publishAnnouncement(
  draft: AnnouncementDraft,
  adminId: string,
): Promise<AnnouncementView> {
  const { data, error } = await (supabase as any)
    .from('announcement')
    .insert({
      user_id: adminId,
      title: draft.title.trim(),
      body: draft.body.trim(),
      priority: draft.priority,
      is_pinned: false,
      is_deleted: false,
    } as any)
    .select('id, title, body, priority, created_at, is_pinned')
    .single()

  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function updateAnnouncement(
  id: string,
  draft: AnnouncementDraft
): Promise<void> {
  const { error } = await (supabase as any)
    .from('announcement')
    .update({
      title: draft.title.trim(),
      body: draft.body.trim(),
      priority: draft.priority,
    } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function toggleAnnouncementPin(announcementId: string, currentPinState: boolean): Promise<void> {
  const { error } = await (supabase as any)
    .from('announcement')
    .update({ is_pinned: !currentPinState } as any)
    .eq('id', announcementId)

  if (error) throw new Error(error.message)
}

export async function retractAnnouncement(announcementId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('announcement')
    .update({ is_deleted: true } as any)
    .eq('id', announcementId)

  if (error) throw new Error(error.message)
}