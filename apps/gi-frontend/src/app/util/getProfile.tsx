import type { Unpromise } from '@genshin-optimizer/common/util'
import type { SupabaseClient } from '@supabase/supabase-js'
import { type User } from '@supabase/supabase-js'

export default async function getProfile(
  supabase: SupabaseClient,
  user: User | null,
) {
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select(`id, username, active_account`)
    .eq('id', user.id)
    .single()

  return data
}
export type Profile = Unpromise<ReturnType<typeof getProfile>>
