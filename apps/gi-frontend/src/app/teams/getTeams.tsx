'use server'
import type { UnArray, Unpromise } from '@genshin-optimizer/common/util'
import type { Database } from '@genshin-optimizer/gi/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
export default async function getTeams(
  supabase: SupabaseClient<Database>,
  accountId: string | null,
) {
  if (!accountId) return []
  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      id,
      created_at,
      name,
      description,
      team_loadouts(
        loadouts(
          id,
          character_id,
          character_key,name,
          description
        ),
        index,
        build_type
      ) `,
    )
    .eq('account_id', accountId)

  if (error) console.error(error)
  return data
}

export type Teams = Exclude<Unpromise<ReturnType<typeof getTeams>>, null>
export type Team = UnArray<Teams>
