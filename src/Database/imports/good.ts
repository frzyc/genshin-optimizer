import { ArtCharDatabase } from "../Database";
import { SandboxStorage } from "../DBStorage";
import { GOSource, IGO, IGOOD, ImportResult, newCounter } from "../exim";
import { setDBVersion } from "../utils";
import { merge } from "./merge";
import { migrate } from "./migrate";
import { parseArtifact, parseCharacter, parseWeapon } from "./parse";

// MIGRATION STEP: Always keep parsing in sync with GOODv1 format

export function importGOOD(data: IGOOD, oldDatabase: ArtCharDatabase): ImportResult | undefined {
  switch (data.version) {
    case 1: return importGOOD1(data, oldDatabase)
  }
}

// TODO: Remove this function or move it somewhere else
function importGOOD1(data: IGOOD, oldDatabase: ArtCharDatabase): ImportResult | undefined {
  const result = parseImport(data)
  if (!result) return
  // TODO
  // Handle the error thrown when the `storage` uses unsupported DB version.
  migrate(result.storage)
  // TODO
  // The `merging` part can be separated into another step in DB migration.
  // We can let the user select finer grain migration options, such as
  // weapon-only migration.
  merge(result, oldDatabase)
  return result
}

/**
 * Parse GOODv1 data format into a parsed data of the version specified in `data`.
 * If the DB version is not specified, the default version is used.
 */
function parseImport(data: IGOOD): ImportResult | undefined {
  const source = data.source, storage = new SandboxStorage()
  const result: ImportResult = { type: "GOOD", storage, source }

  if (data.artifacts) {
    result.artifacts = newCounter()
    const counter = result.artifacts
    counter.total = data.artifacts.length

    data.artifacts.forEach((a, i) => {
      const parsed = parseArtifact(a)
      if (!parsed) counter.invalid.push(a)
      else storage.set(`artifact_${i}`, a)
    })
  }
  if (data.weapons) {
    result.weapons = newCounter()
    const counter = result.weapons
    counter.total = data.weapons!.length

    data.weapons.forEach((w, i) => {
      const parsed = parseWeapon(w)
      if (!parsed) counter.invalid.push(w)
      else storage.set(`weapon_${i}`, w)
      return parsed ? [parsed] : []
    })

    result.weapons = counter
  }
  if (data.characters) {
    result.characters = newCounter()
    const counter = result.characters
    counter.total = data.characters.length

    data.characters.forEach(c => {
      const parsed = parseCharacter(c)
      if (!parsed) counter.invalid.push(c)

      // We invalidate build results here because we need to do
      // it regardless of whether the file has character/art data.
      if (c.buildSettings) {
        c.buildSettings.builds = []
        c.buildSettings.buildDate = 0
      }

      storage.set(`char_${c.key}`, c);
    })
  }
  if (source === GOSource) {
    const { dbVersion, states } = data as unknown as IGO
    if (dbVersion < 8) return // Something doesn't look right here
    setDBVersion(storage, dbVersion)
    states && states.forEach(s => {
      const { key, ...state } = s as any
      if (!key) return
      storage.set(`state_${key}`, state)
    });
  } else {
    // DO NOT CHANGE THE DB VERSION
    // Update this ONLY when it has been verified that base GOODv1 is a valid GO
    // of that particular version. Any missing/extra keys could crash the system.
    setDBVersion(storage, 8)
  }
  return result
}
