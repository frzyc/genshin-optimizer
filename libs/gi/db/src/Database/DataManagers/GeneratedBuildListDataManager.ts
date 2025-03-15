import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  type ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'

export interface GeneratedBuild {
  weaponId?: string
  artifactIds: Record<ArtifactSlotKey, string | undefined>
}

export interface GeneratedBuildList {
  builds: GeneratedBuild[]
  buildDate: number
}

export class GeneratedBuildListDataManager extends DataManager<
  string,
  'generatedBuildList',
  GeneratedBuildList,
  GeneratedBuildList,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'generatedBuildList')
  }

  override validate(obj: unknown): GeneratedBuildList | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    let { builds, buildDate } = obj as GeneratedBuildList

    if (!Array.isArray(builds)) {
      builds = []
      buildDate = 0
    } else {
      builds = builds
        .map((build) => {
          if (typeof build !== 'object' || build === null) return undefined
          const { artifactIds: artifactIdsRaw } = build as GeneratedBuild
          if (typeof artifactIdsRaw !== 'object' || artifactIdsRaw === null)
            return undefined
          let { weaponId } = build as GeneratedBuild
          if (weaponId && !this.database.weapons.get(weaponId))
            weaponId = undefined

          const artifactIds = objKeyMap(allArtifactSlotKeys, (slotKey) =>
            this.database.arts.get(artifactIdsRaw[slotKey])?.slotKey === slotKey
              ? artifactIdsRaw[slotKey]
              : undefined,
          )

          return { artifactIds, weaponId }
        })
        .filter((build) => build !== undefined)

      if (!Number.isInteger(buildDate)) buildDate = 0
    }

    return {
      buildDate,
      builds,
    }
  }

  new(data: GeneratedBuildList) {
    const id = this.generateKey()
    this.set(id, { ...data })
    return id
  }
}
