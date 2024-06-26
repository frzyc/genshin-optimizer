import type { Database } from '@genshin-optimizer/gi/supabase'
import { createBrowserClient } from '@supabase/ssr'

export function useSupabase() {
  // Create a supabase client on the browser with project's credentials
  // Uses a singleton pattern
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
