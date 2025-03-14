'use server'
import type { UnArray, Unpromise } from '@genshin-optimizer/common/util'
import type { Database } from '@genshin-optimizer/gi/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
export default async function getTeam(
  supabase: SupabaseClient<Database>,
  accountId: string | null,
  teamId: string,
) {
  if (!accountId) return null
  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      id,
      created_at,
      name,
      description,
      team_loadouts(
        loadout:loadouts(
          id,
          character:characters(
            id,
            key,
            level,
            ascension,
            talent_auto,
            talent_skill,
            talent_burst,
            constellation,
            artifacts:artifacts(
              id,
              level,
              rarity,
              setKey,
              slotKey,
              mainStatKey,
              substats( key, value, index )
            ),
            weapon:weapons( id, key, level, ascension, refinement )
          ),
          character_id,
          character_key,
          name,
          description
        ),
        index,
        build_type
      ) `,
    )
    .eq('account_id', accountId)
    .eq('id', teamId)
    .maybeSingle()

  if (error) console.error(error)
  return data
}

export type Team = Exclude<Unpromise<ReturnType<typeof getTeam>>, null>
export type TeamLoadout = UnArray<Team['team_loadouts']>
export type TeamLoadoutCharacter = Exclude<
  Exclude<Team['team_loadouts']['0']['loadout'], null>['character'],
  null
>
