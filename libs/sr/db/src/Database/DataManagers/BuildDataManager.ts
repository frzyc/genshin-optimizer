import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allRelicSlotKeys,
  type RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
export interface Build {
  name: string
  description: string

  lightConeId?: string
  relicIds: Record<RelicSlotKey, string | undefined>
}

export class BuildDataManager extends DataManager<
  string,
  'builds',
  Build,
  Build
> {
  constructor(database: SroDatabase) {
    super(database, 'builds')
  }
  override validate(obj: unknown): Build | undefined {
    let { name, description, lightConeId, relicIds } = obj as Build
    if (typeof name !== 'string') name = 'Build Name'
    if (typeof description !== 'string') description = ''
    if (lightConeId && !this.database.lightCones.get(lightConeId))
      lightConeId = undefined

    if (typeof relicIds !== 'object')
      relicIds = objKeyMap(allRelicSlotKeys, () => undefined)
    else
      relicIds = objKeyMap(allRelicSlotKeys, (sk) => {
        const id = relicIds[sk]
        if (!id) return undefined
        const relic = this.database.relics.get(id)
        if (!relic) return undefined
        if (relic.slotKey !== sk) return undefined
        return id
      })
    return {
      name,
      description,
      lightConeId,
      relicIds,
    }
  }

  new(build: Partial<Build> = {}): string {
    const id = this.generateKey()
    this.set(id, build)
    return id
  }
  duplicate(buildId: string): string {
    const build = this.get(buildId)
    if (!build) return ''
    return this.new(structuredClone(build))
  }
  override remove(key: string, notify?: boolean): Build | undefined {
    const build = super.remove(key, notify)
    // remove data from teamChar first
    this.database.teamChars.entries.forEach(
      ([teamCharId, teamChar]) =>
        teamChar.buildIds.includes(key) &&
        this.database.teamChars.set(teamCharId, {})
    )
    // once teamChars are validated, teams can be validated as well
    this.database.teams.entries.forEach(
      ([teamId, team]) =>
        team.loadoutData?.some(
          (loadoutDatum) =>
            loadoutDatum?.buildId === key || loadoutDatum?.compareBuildId
        ) && this.database.teams.set(teamId, {}) // trigger a validation
    )

    return build
  }
}
