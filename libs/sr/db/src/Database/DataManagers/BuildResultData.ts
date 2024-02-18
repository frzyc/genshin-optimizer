import { deepClone } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import {
  allCharacterKeys,
  allRelicSlotKeys,
} from '@genshin-optimizer/sr/consts'

import type { SroDatabase } from '../Database'
import { SroDataManager } from '../SroDataManager'

export interface IBuildResult {
  builds: string[][]
  buildDate: number
}

export class BuildResultDataManager extends SroDataManager<
  CharacterKey,
  'buildResults',
  IBuildResult,
  IBuildResult
> {
  constructor(database: SroDatabase) {
    super(database, 'buildResults')
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
