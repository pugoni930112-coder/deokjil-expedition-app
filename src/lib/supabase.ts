import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  )
}

/** Returns the shared Supabase client, or explains which local settings are missing. */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!isSupabaseConfigured() || !supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Supabase settings are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.',
    )
  }

  supabaseClient = createClient(supabaseUrl, supabasePublishableKey)
  return supabaseClient
}
