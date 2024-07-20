'use server'
import type { UnArray, Unpromise } from '@genshin-optimizer/common/util'
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
      `id, created_at, setKey, slotKey, level, rarity, substats(key, value), lock, mainStatKey, character:characters(id, key)`
    )
    .eq('account_id', accountId)

  if (error) console.error(error)
  return data
}
export type Artifacts = Exclude<
  Unpromise<ReturnType<typeof getArtifacts>>,
  null
>
export type Artifact = UnArray<Artifacts>
