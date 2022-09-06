
import { DBStorage } from "../DBStorage";
import { BuildSetting } from "../Data/BuildsettingData";
import { GOSource, IGO, IGOOD } from "../exim";
import { currentDBVersion } from "../imports/migrate";

export function exportGOOD(storage: DBStorage): IGOOD & IGO {
  const artifactIDs = new Map<string, number>()
  const artifacts = storage.entries
    .filter(([key]) => key.startsWith("artifact_"))
    .map(([id, value], i) => {
      artifactIDs.set(id, i)
      return JSON.parse(value)
    })
  return {
    format: "GOOD",
    dbVersion: currentDBVersion,
    source: GOSource,
    version: 1,
    characters: storage.entries
      .filter(([key]) => key.startsWith("char_"))
      .map(([_, value]) => JSON.parse(value)),
    artifacts,
    weapons: storage.entries
      .filter(([key]) => key.startsWith("weapon_"))
      .map(([_, value]) => JSON.parse(value)),
    states: storage.entries
      .filter(([key]) => key.startsWith("state_"))
      .map(([key, value]) => ({ ...JSON.parse(value), key: key.split("state_")[1] })),
    buildSettings: storage.entries
      .filter(([key]) => key.startsWith("buildSetting_"))
      .map(([key, value]) => {
        const result: BuildSetting & { key: string } = { ...JSON.parse(value), key: key.split("buildSetting_")[1] }
        // Make sure the artifact ids match the new ids after import
        result.builds = result.builds.map(x => x.map(x => artifactIDs.has(x) ? `artifact_${artifactIDs.get(x)}` : "").filter(x => x))
        return result
      }),
  }
}
