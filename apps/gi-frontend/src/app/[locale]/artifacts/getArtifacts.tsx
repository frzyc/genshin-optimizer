'use server'
import type { Database } from '@genshin-optimizer/gi/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
export default async function getArtifacts(
  supabase: SupabaseClient<Database>,
  accountId: string | null
) {
  if (!accountId) return []
  const { data, error } = await supabase
    .from('artifacts')
    .select(
      `id, created_at, setKey, slotKey, level, rarity, substats, lock, mainStatKey`
    )
    .eq('account', accountId)

  if (error) console.error(error)
  return data
}
