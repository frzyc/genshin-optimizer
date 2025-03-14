'use server'
import type { UnArray, Unpromise } from '@genshin-optimizer/common/util'
import type { Database } from '@genshin-optimizer/gi/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
export default async function getLoadouts(
  supabase: SupabaseClient<Database>,
  accountId: string | null,
) {
  if (!accountId) return []
  const { data, error } = await supabase
    .from('loadouts')
    .select(
      `
      id,
      created_at,
      character_id,
      character_key,
      name,
      description
      `,
    )
    .eq('account_id', accountId)

  if (error) console.error(error)
  return data
}

export type Loadouts = Exclude<Unpromise<ReturnType<typeof getLoadouts>>, null>
export type Loadout = UnArray<Loadouts>
