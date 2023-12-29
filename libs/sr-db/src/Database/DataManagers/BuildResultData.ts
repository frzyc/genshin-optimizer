import type { CharacterKey } from '@genshin-optimizer/sr-consts'
import {
  allCharacterKeys,
  allRelicSlotKeys,
} from '@genshin-optimizer/sr-consts'
import { deepClone } from '@genshin-optimizer/util'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

export interface IBuildResult {
  builds: string[][]
  buildDate: number
}

const storageKey = 'sro_buildResults'
const storageHash = 'sro_buildResult_'
export class BuildResultDataManager extends DataManager<
  CharacterKey,
  typeof storageKey,
  IBuildResult,
  IBuildResult,
  SroDatabase
> {
  constructor(database: SroDatabase) {
    super(database, storageKey)
    for (const key of this.database.storage.keys)
      if (key.startsWith(storageHash)) {
        const charKey = key.split(storageHash)[1] as CharacterKey
        if (!this.set(charKey, {})) this.database.storage.remove(key)
      }
  }
  override toStorageKey(key: string): string {
    return `${storageHash}${key}`
  }
  override validate(obj: unknown, key: CharacterKey): IBuildResult | undefined {
    if (typeof obj !== 'object') return undefined
    if (!allCharacterKeys.includes(key)) return undefined
    let { builds, buildDate } = obj as IBuildResult

    if (!Array.isArray(builds)) {
      builds = []
      buildDate = 0
    } else {
      builds = builds
        .map((build) => {
          if (!Array.isArray(build)) return []
          const filteredBuild = build.filter((id) =>
            this.database.relics.get(id)
          )
          // Check that builds has only 1 relic of each slot
          if (
            allRelicSlotKeys.some(
              (s) =>
                filteredBuild.filter(
                  (id) => this.database.relics.get(id)?.slotKey === s
                ).length > 1
            )
          )
            return []
          return filteredBuild
        })
        .filter((x) => x.length)
      if (!Number.isInteger(buildDate)) buildDate = 0
    }

    return { builds, buildDate }
  }
  override get(key: CharacterKey) {
    return super.get(key) ?? initialBuildResult
  }
}

const initialBuildResult: IBuildResult = deepClone({
  builds: [],
  buildDate: 0,
})
