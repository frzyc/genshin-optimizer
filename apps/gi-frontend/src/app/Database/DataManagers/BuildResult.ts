import type { CharacterKey } from '@genshin-optimizer/consts'
import {
  allArtifactSlotKeys,
  allCharacterKeys,
} from '@genshin-optimizer/consts'
import { DataManager } from '../DataManager'
import type { ArtCharDatabase } from '../Database'
import { deepClone } from '@genshin-optimizer/util'

export interface IBuildResult {
  builds: string[][]
  buildDate: number
}

export class BuildResultDataManager extends DataManager<
  CharacterKey,
  'buildResults',
  IBuildResult,
  IBuildResult
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'buildResults')
    for (const key of this.database.storage.keys)
      if (key.startsWith('buildResult_')) {
        const charKey = key.split('buildResult_')[1] as CharacterKey
        if (!this.set(charKey, {})) this.database.storage.remove(key)
      }
  }
  override toStorageKey(key: string): string {
    return `buildResult_${key}`
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
          const filteredBuild = build.filter((id) => this.database.arts.get(id))
          // Check that builds has only 1 artifact of each slot
          if (
            allArtifactSlotKeys.some(
              (s) =>
                filteredBuild.filter(
                  (id) => this.database.arts.get(id)?.slotKey === s
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
