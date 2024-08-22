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
  relicIds: Record<RelicSlotKey, string>
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
      relicIds = objKeyMap(allRelicSlotKeys, () => '')
    else
      relicIds = objKeyMap(allRelicSlotKeys, (sk) => {
        const id = relicIds[sk]
        if (!id) return ''
        const relic = this.database.relics.get(id)
        if (!relic) return ''
        if (relic.slotKey !== sk) return ''
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
    // remove data from loadout first
    this.database.loadouts.entries.forEach(
      ([loadoutId, loadout]) =>
        loadout.buildIds.includes(key) &&
        this.database.loadouts.set(loadoutId, {})
    )
    // once loadouts are validated, teams can be validated as well
    this.database.teams.entries.forEach(
      ([teamId, team]) =>
        team.loadoutMetadata?.some(
          (loadoutMetadatum) =>
            loadoutMetadatum?.buildId === key ||
            loadoutMetadatum?.compareBuildId
        ) && this.database.teams.set(teamId, {}) // trigger a validation
    )

    return build
  }
}
