import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Sign in with email + password via Supabase Auth.
 * The LoginPage uses an "username" field — we treat that value as the email.
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data.session
}

/** Sign out the current user. */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/** Returns the currently active session (null if not logged in). */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)
  return data.session
}

/**
 * Fetch the user row from the `user` table for the given auth UID.
 * We need this to check the `role` column (must be 'admin').
 */
export async function fetchUserProfile(
  uid: string,
): Promise<Database['public']['Tables']['user']['Row'] | null> {
  const { data, error } = await (supabase as any)
    .from('user')
    .select('*')
    .eq('id', uid)
    .eq('is_deleted', false)
    .single()

  if (error) throw new Error(error.message)
  return data as Database['public']['Tables']['user']['Row'] | null
}

/** Listen to auth state changes (login / logout / token refresh). */
export function onAuthStateChange(callback: (session: unknown) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}