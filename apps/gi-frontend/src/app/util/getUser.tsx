import type { SupabaseClient } from '@supabase/supabase-js'

export default async function getUser(supabase: SupabaseClient) {
  const data = await supabase.auth.getUser()
  const {
    data: { user },
  } = data

  return user
}
