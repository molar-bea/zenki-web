import { supabase } from '../lib/supabase'
import type { AnnouncementView, AnnouncementDraft } from '../types/database.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapRow(row: {
  id: string
  title: string
  body: string
  target_role: string | null
  created_at: string
}): AnnouncementView {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    // target_role drives the audience badge shown in the UI
    priority: row.target_role === 'admin' ? 'High priority' : 'Standard',
    audience: row.target_role === 'admin' ? 'Admin' : 'All students',
    publishedAt: new Date(row.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

// ─── Admin use case 2: Publish campus announcements ───────────────────────────
// Admin drafts a title + body, picks an audience, and hits Publish.
// The announcement is immediately visible in every student's feed.

/**
 * Fetch all live (non-deleted) announcements, newest first.
 * Shown in the admin's pinned feed panel so they can review what was published.
 */
export async function fetchAnnouncements(): Promise<AnnouncementView[]> {
  const { data, error } = await (supabase as any)
    .from('announcement')
    .select('id, title, body, target_role, created_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

/**
 * Publish a new announcement.
 * @param draft   – form values from AnnouncementsPage
 * @param adminId – UUID of the logged-in admin (from auth session)
 */
export async function publishAnnouncement(
  draft: AnnouncementDraft,
  adminId: string,
): Promise<AnnouncementView> {
  const targetRole = draft.audience === 'Admin' ? 'admin' : 'student'

  const { data, error } = await (supabase as any)
    .from('announcement')
    .insert({
      user_id: adminId,
      title: draft.title.trim(),
      body: draft.body.trim(),
      target_role: targetRole,
      is_deleted: false,
    } as any)
    .select('id, title, body, target_role, created_at')
    .single()

  if (error) throw new Error(error.message)
  return mapRow(data)
}

/**
 * Retract an announcement (soft-delete).
 * The announcement disappears from all student feeds immediately.
 */
export async function retractAnnouncement(announcementId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('announcement')
    .update({ is_deleted: true } as any)
    .eq('id', announcementId)

  if (error) throw new Error(error.message)
}