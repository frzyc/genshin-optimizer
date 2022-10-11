import { allCharacterKeys, CharacterKey } from "../../Types/consts";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { IGO, IGOOD, ImportResult } from "../exim";

export interface IBuildResult {
  builds: string[][]
  buildDate: number,
}

export class BuildResultDataManager extends DataManager<CharacterKey, string, "buildResults", IBuildResult, IBuildResult>{
  constructor(database: ArtCharDatabase) {
    super(database, "buildResults")
    for (const key of this.database.storage.keys) {
      if (key.startsWith("buildResult_")) {
        const [, charKey] = key.split("buildResult_")
        if (!this.set(charKey as CharacterKey, this.database.storage.get(key)))
          this.database.storage.remove(key)
      }
    }
  }
  toStorageKey(key: string): string {
    return `buildResult_${key}`
  }
  validate(obj: object, key: string): IBuildResult | undefined {
    if (!allCharacterKeys.includes(key as CharacterKey)) return
    let { builds, buildDate } = (obj as any) ?? {}

    if (!Array.isArray(builds)) {
      builds = []
      buildDate = 0
    } else {
      builds = builds.map(build => {
        if (!Array.isArray(build)) return []
        return build.filter(id => this.database.arts.get(id))
      }).filter(x => x.length)
      if (!Number.isInteger(buildDate)) buildDate = 0
    }

    return { builds, buildDate }
  }
  get(key: CharacterKey) {
    const bs = super.get(key)
    if (bs) return bs
    const newBs = initialBuildResult()
    this.setCached(key, newBs)
    return newBs
  }

  exportGOOD(good: Partial<IGOOD & IGO>) {
    const artifactIDs = new Map<string, number>()
    Object.entries(this.database.arts.data).forEach(([id, value], i) => {
      artifactIDs.set(id, i)
    })
    good[this.goKey as any] = Object.entries(this.data).map(([id, value]) =>
      ({ ...value, id, builds: value.builds.map(b => b.map(x => artifactIDs.has(x) ? `artifact_${artifactIDs.get(x)}` : "")) })
    )
  }
  importGOOD(good: IGOOD & IGO, result: ImportResult) {
    const buildResults = good[this.goKey]
    if (buildResults && Array.isArray(buildResults)) buildResults.forEach(b => {
      const { id, ...rest } = b
      if (!id || !allCharacterKeys.includes(id as CharacterKey)) return
      if (rest.builds) //preserve the old build ids
        rest.builds = rest.builds.map(build => build.map(i => result.importArtIds.get(i) ?? ""))

      this.set(id as CharacterKey, { ...rest })
    })
  }
}

const initialBuildResult = (): IBuildResult => ({
  builds: [],
  buildDate: 0,
})
