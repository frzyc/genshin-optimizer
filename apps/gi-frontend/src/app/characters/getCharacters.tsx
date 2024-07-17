'use server'
import type { Database } from '@genshin-optimizer/gi/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
export default async function getCharacters(
  supabase: SupabaseClient<Database>,
  accountId: string | null
) {
  if (!accountId) return []
  const { data, error } = await supabase
    .from('characters')
    .select(
      `id, created_at, key, level, ascension, talent_auto, talent_skill, talent_burst, constellation`
    )
    .eq('account_id', accountId)

  if (error) console.error(error)
  return data
}
