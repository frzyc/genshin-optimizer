import { objKeyMap } from '@genshin-optimizer/common/util'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import type { RelicIds } from '../../Types'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

export type GeneratedBuild = {
  value: number //TODO: remove this when build display is more refined.
  lightConeId?: string
  relicIds: RelicIds
}

export interface GeneratedBuildList {
  //generated opt builds
  builds: Array<GeneratedBuild>
  buildDate: number
}

export class GeneratedBuildListDataManager extends DataManager<
  string,
  'generatedBuildList',
  GeneratedBuildList,
  GeneratedBuildList
> {
  constructor(database: SroDatabase) {
    super(database, 'generatedBuildList')
  }
  override validate(obj: object): GeneratedBuildList | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    let { builds, buildDate } = obj as GeneratedBuildList

    if (!Array.isArray(builds)) {
      builds = []
      buildDate = 0
    } else {
      builds = builds
        .map((build) => {
          if (typeof build !== 'object' || build === null) return undefined
          const { relicIds: relicIdsRaw, value } = build as GeneratedBuild
          if (typeof value !== 'number') return undefined
          if (typeof relicIdsRaw !== 'object' || relicIdsRaw === null)
            return undefined
          let { lightConeId } = build as GeneratedBuild
          if (lightConeId && !this.database.lightCones.get(lightConeId))
            lightConeId = undefined

          const relicIds = objKeyMap(allRelicSlotKeys, (slotKey) =>
            this.database.relics.get(relicIdsRaw[slotKey])?.slotKey === slotKey
              ? relicIdsRaw[slotKey]
              : undefined
          )

          return { relicIds, lightConeId, value }
        })
        .filter((b) => b) as GeneratedBuild[]
      if (!Number.isInteger(buildDate)) buildDate = 0
    }

    return {
      builds,
      buildDate,
    }
  }
  new(data: GeneratedBuildList) {
    const id = this.generateKey()
    this.set(id, { ...data })
    return id
  }
}
