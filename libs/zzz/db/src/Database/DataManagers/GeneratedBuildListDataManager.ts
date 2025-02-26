import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { DiscIds, ZzzDatabase } from '../..'
import { DataManager } from '../DataManager'

export type GeneratedBuild = {
  value: number //TODO: remove this when build display is more refined.
  wengineId?: string
  discIds: DiscIds
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
  constructor(database: ZzzDatabase) {
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
          const { discIds: discIdsRaw, value } = build as GeneratedBuild
          if (typeof value !== 'number') return undefined
          if (typeof discIdsRaw !== 'object' || discIdsRaw === null)
            return undefined
          let { wengineId } = build as GeneratedBuild
          if (wengineId && !this.database.wengines.get(wengineId))
            wengineId = undefined

          const discIds = objKeyMap(allDiscSlotKeys, (slotKey) =>
            this.database.discs.get(discIdsRaw[slotKey])?.slotKey === slotKey
              ? discIdsRaw[slotKey]
              : undefined
          )

          return { discIds, wengineId, value }
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
