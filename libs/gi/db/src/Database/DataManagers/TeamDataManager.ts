import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allHitModeKeys,
  type AdditiveReactionKey,
  type AmpReactionKey,
  type HitModeKey,
} from '@genshin-optimizer/gi/consts'
import type { EleEnemyResKey } from '@genshin-optimizer/gi/keymap'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
export interface Team {
  name: string
  description: string

  hitMode: HitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey

  enemyOverride: Partial<
    Record<
      EleEnemyResKey | 'enemyLevel' | 'enemyDefRed_' | 'enemyDefIgn_',
      number
    >
  >

  compareData: boolean
  characterIds: string[] // ids to TeamCharacters
}

export class TeamDataManager extends DataManager<
  string,
  'teams',
  Team,
  Team,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'teams')
    for (const key of this.database.storage.keys)
      if (key.startsWith('team_') && !this.set(key, {}))
        this.database.storage.remove(key)
  }
  override validate(obj: unknown): Team | undefined {
    return validateTeam(obj, this.database)
  }

  new(value: Team): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override clear(): void {
    super.clear()
  }
}

const validReactionKeys = [
  ...allAmpReactionKeys,
  ...allAdditiveReactions,
] as const
function validateTeam(
  obj: unknown = {},
  database: ArtCharDatabase
): Team | undefined {
  let {
    name,
    description,
    hitMode,
    reaction,
    enemyOverride,
    compareData,
    characterIds,
  } = obj as Team
  if (typeof name !== 'string') name = 'Team Name'
  if (typeof description !== 'string') description = 'Team Description'
  if (!allHitModeKeys.includes(hitMode)) hitMode = 'avgHit'
  if (
    reaction &&
    !validReactionKeys.includes(reaction as (typeof validReactionKeys)[number])
  )
    reaction = undefined

  if (
    typeof enemyOverride !== 'object' ||
    !Object.entries(enemyOverride).map(([_, num]) => typeof num === 'number')
  )
    enemyOverride = {}

  if (typeof compareData !== 'boolean') compareData = false
  if (!Array.isArray(characterIds)) characterIds = []
  else {
    const charIds = database.teamChars.keys
    characterIds = characterIds.filter((id) => charIds.includes(id))
    // only allow 4 people per team
    characterIds = characterIds.slice(0, 4)
  }
  return {
    name,
    description,
    hitMode,
    reaction,
    enemyOverride,
    compareData,
    characterIds,
  }
}
