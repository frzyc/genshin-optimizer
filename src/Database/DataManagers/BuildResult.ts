import { allCharacterKeys, CharacterKey } from "../../Types/consts";
import { deepFreeze } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { IGO, IGOOD, ImportResult } from "../exim";

export interface IBuildResult {
  builds: string[][]
  buildDate: number,
}

export class BuildResultDataManager extends DataManager<CharacterKey, "buildResults", IBuildResult, IBuildResult>{
  constructor(database: ArtCharDatabase) {
    super(database, "buildResults")
    for (const key of this.database.storage.keys)
      if (key.startsWith("buildResult_")) {
        const charKey = key.split("buildResult_")[1] as CharacterKey
        if (!this.set(charKey, {})) this.database.storage.remove(key)
      }
  }
  toStorageKey(key: string): string {
    return `buildResult_${key}`
  }
  validate(obj: object, key: CharacterKey): IBuildResult | undefined {
    if (!allCharacterKeys.includes(key)) return
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
    return super.get(key) ?? initialBuildResult
  }

  exportGOOD(good: Partial<IGOOD & IGO>) {
    const artIDs = new Map<string, number>(Object.keys(this.database.arts.data).map((key, i) => [key, i]))
    good[this.goKey] = Object.entries(this.data).map(([id, value]) =>
      ({ ...value, id, builds: value.builds.map(b => b.map(x => artIDs.has(x) ? `artifact_${artIDs.get(x)}` : "")) }))
  }
  importGOOD(good: IGOOD & IGO, result: ImportResult) {
    const buildResults = good[this.goKey]
    if (buildResults && Array.isArray(buildResults)) buildResults.forEach(b => {
      const { id, ...rest } = b
      if (!id || !allCharacterKeys.includes(id as CharacterKey)) return
      if (rest.builds) // Preserve the old build ids
        rest.builds = rest.builds.map(build => build.map(i => result.importArtIds.get(i) ?? ""))

      this.set(id as CharacterKey, { ...rest })
    })
  }
}

const initialBuildResult: IBuildResult = deepFreeze({
  builds: [],
  buildDate: 0,
})
