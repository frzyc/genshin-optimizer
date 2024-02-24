import { deepClone } from '@genshin-optimizer/common/util'
import type { EleEnemyResKey } from '@genshin-optimizer/gi/keymap'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
export interface Team {
  name: string
  description: string

  enemyOverride: Partial<
    Record<
      EleEnemyResKey | 'enemyLevel' | 'enemyDefRed_' | 'enemyDefIgn_',
      number
    >
  >

  teamCharIds: string[]
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

  new(value: Partial<Team> = {}): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override remove(key: string, notify?: boolean): Team | undefined {
    const team = super.remove(key, notify)
    if (!team) return team
    const { teamCharIds } = team
    teamCharIds.map((teamCharId) => this.database.teamChars.remove(teamCharId))
    return team
  }
  override clear(): void {
    super.clear()
  }

  duplicate(teamId: string): string {
    const teamRaw = this.database.teams.get(teamId)
    if (!teamRaw) return ''
    const team = deepClone(teamRaw)
    team.teamCharIds = team.teamCharIds.map((teamCharId) =>
      this.database.teamChars.duplicate(teamCharId)
    )
    team.name = `${team.name} (duplicated)`
    return this.new(team)
  }
  export(teamId: string): object {
    const team = this.database.teams.get(teamId)
    if (!team) return {}
    const { teamCharIds, ...rest } = team
    return {
      ...rest,
      teamChars: teamCharIds.map((teamCharId) =>
        this.database.teamChars.export(teamCharId)
      ),
    }
  }
  import(data: object): string {
    const { teamChars, ...rest } = data as Team & { teamChars: object[] }
    const id = this.generateKey()
    if (
      !this.set(id, {
        ...rest,
        name: `${rest.name ?? ''} (Imported)`,
        teamCharIds: teamChars.map((obj) =>
          this.database.teamChars.import(obj)
        ),
      } as Team)
    )
      return ''
    return id
  }
}

function validateTeam(
  obj: unknown = {},
  database: ArtCharDatabase
): Team | undefined {
  let { name, description, enemyOverride, teamCharIds } = obj as Team
  if (typeof name !== 'string') name = 'Team Name'
  if (typeof description !== 'string') description = 'Team Description'

  if (
    typeof enemyOverride !== 'object' ||
    !Object.entries(enemyOverride).map(([_, num]) => typeof num === 'number')
  )
    enemyOverride = {}

  if (!Array.isArray(teamCharIds)) teamCharIds = []
  else {
    const charIds = database.teamChars.keys
    teamCharIds = teamCharIds.filter((id) => charIds.includes(id))
    // only allow 4 people per team
    teamCharIds = teamCharIds.slice(0, 4)
  }
  return {
    name,
    description,
    enemyOverride,
    teamCharIds,
  }
}
