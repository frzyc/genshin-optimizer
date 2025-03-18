'use server'
import type { UnArray, Unpromise } from '@genshin-optimizer/common/util'
import type { Database } from '@genshin-optimizer/gi/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
export default async function getWeapons(
  supabase: SupabaseClient<Database>,
  accountId: string | null
) {
  if (!accountId) return []
  const { data, error } = await supabase
    .from('weapons')
    .select('id, created_at, key, level, ascension, refinement, lock')
    .eq('account_id', accountId)

  if (error) console.error(error)
  return data
}

export type Weapons = Exclude<Unpromise<ReturnType<typeof getWeapons>>, null>
export type Weapon = UnArray<Weapons>
