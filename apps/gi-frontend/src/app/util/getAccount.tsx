import type { Unpromise } from '@genshin-optimizer/common/util'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Profile } from './getProfile'

export default async function getAccount(
  supabase: SupabaseClient,
  profile: Profile | null
) {
  if (!profile) return null
  const { data } = await supabase
    .from('accounts')
    .select('id, created_at, uid, profile, name')
    .eq('profile', profile.id)
    .single()

  return data
}
export type Account = Unpromise<ReturnType<typeof getAccount>>
