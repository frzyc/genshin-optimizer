import { deepClone, range } from '@genshin-optimizer/common/util'
import type { EleEnemyResKey } from '@genshin-optimizer/gi/keymap'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
export interface Team {
  name: string
  description: string

  enemyOverride: Partial<
    Record<
      EleEnemyResKey | 'enemyLevel' | 'enemyDefRed_' | 'enemyDefIgn_',
      number
    >
  >

  teamCharIds: Array<string | undefined>
  lastEdit: number
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
  newName() {
    const existing = this.values
    for (let num = existing.length + 1; num <= existing.length * 2; num++) {
      const name = `Team Name ${num}`
      if (existing.some((tc) => tc.name !== name)) return name
    }
    return `Team Name`
  }
  override validate(obj: unknown): Team | undefined {
    let { name, description, enemyOverride, teamCharIds, lastEdit } =
      obj as Team
    if (typeof name !== 'string') name = this.newName()
    if (typeof description !== 'string') description = 'Team Description'

    {
      // validate enemyOverride
      if (typeof enemyOverride !== 'object') enemyOverride = {}

      if (typeof enemyOverride.enemyLevel !== 'number')
        enemyOverride.enemyLevel = 100

      if (typeof enemyOverride.enemyDefRed_ !== 'number')
        enemyOverride.enemyDefRed_ = 0

      if (typeof enemyOverride.enemyDefIgn_ !== 'number')
        enemyOverride.enemyDefIgn_ = 0

      allElementWithPhyKeys.map((ele) => {
        const key = `${ele}_enemyRes_` as EleEnemyResKey
        if (typeof enemyOverride[key] !== 'number') enemyOverride[key] = 10
      })
    }

    {
      // validate teamCharIds
      if (!Array.isArray(teamCharIds))
        teamCharIds = range(0, 3).map(() => undefined)

      const charIds = this.database.teamChars.keys
      teamCharIds = range(0, 3).map((ind) => {
        const id = teamCharIds[ind]
        if (id && charIds.includes(id)) return id
        return undefined
      })

      // make sure there isnt a team without "Active" character, by shifting characters forward.
      if (!teamCharIds[0] && teamCharIds.some((tcid) => tcid)) {
        const index = teamCharIds.findIndex((tcid) => !!tcid)
        teamCharIds[0] = teamCharIds[index]
        teamCharIds[index] = undefined
      }
    }

    if (typeof lastEdit !== 'number') lastEdit = Date.now()

    return {
      name,
      description,
      enemyOverride,
      teamCharIds,
      lastEdit,
    }
  }

  new(value: Partial<Team> = {}): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override clear(): void {
    super.clear()
  }

  duplicate(teamId: string): string {
    const teamRaw = this.database.teams.get(teamId)
    if (!teamRaw) return ''
    const team = deepClone(teamRaw)
    team.name = `${team.name} (duplicated)`
    return this.new(team)
  }
  export(teamId: string): object {
    const team = this.database.teams.get(teamId)
    if (!team) return {}
    const { teamCharIds, ...rest } = team
    return {
      ...rest,
      teamChars: teamCharIds.map(
        (teamCharId) => teamCharId && this.database.teamChars.export(teamCharId)
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

  getActiveTeamChar(teamId: string) {
    const team = this.database.teams.get(teamId)
    const teamCharId = team?.teamCharIds[0]
    return this.database.teamChars.get(teamCharId)
  }
}
