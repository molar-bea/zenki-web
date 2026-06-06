import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

// ─── Reads from .env (VITE_ prefix required by Vite) ─────────────────────────
// Copy .env.example → .env and fill in your real values.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
// ─────────────────────────────────────────────────────────────────────────────

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)