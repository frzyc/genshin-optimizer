import { DBStorage } from "../DBStorage";
import { GOSource, IGO, IGOOD } from "../exim";
import { currentDBVersion } from "../imports/migrate";

export function exportGOOD(storage: DBStorage): IGOOD & IGO {
  return {
    format: "GOOD",
    dbVersion: currentDBVersion,
    source: GOSource,
    version: 1,
    characters: storage.entries
      .filter(([key]) => key.startsWith("char_"))
      .map(([_, value]) => {
        // Invalidate build results since we won't use it on imports either
        const result = JSON.parse(value)
        if (result.buildSettings) {
          result.buildSettings.builds = []
          result.buildSettings.buildDate = 0
        }
        return result
      }),
    artifacts: storage.entries
      .filter(([key]) => key.startsWith("artifact_"))
      .map(([_, value]) => JSON.parse(value)),
    weapons: storage.entries
      .filter(([key]) => key.startsWith("weapon_"))
      .map(([_, value]) => JSON.parse(value)),

    states: storage.entries
      .filter(([key]) => key.startsWith("state_"))
      .map(([key, value]) => ({ ...JSON.parse(value), key: key.split("state_")[1] })),
    buildSettings: storage.entries
      .filter(([key]) => key.startsWith("buildSetting_"))
      .map(([key, value]) => ({ ...JSON.parse(value), key: key.split("buildSetting_")[1] })),
  }
}
