import { GOSource, IGO, IGOOD, ImportResult, newImportResult } from "../exim";
import { parseArtifact, parseCharacter, parseWeapon } from "./parse";

// MIGRATION STEP: Always keep parsing in sync with GOODv1 format

export function importGOOD(data: IGOOD): ImportResult | undefined {
  switch (data.version) {
    case 1: return importGOOD1(data)
  }
}

/**
 * Parse GOODv1 data format into a parsed data of the version specified in `data`.
 * If the DB version is not specified, the default version is used.
 */
function importGOOD1(data: IGOOD): ImportResult | undefined {
  const source = data.source ?? "Unknown"
  const result: ImportResult = newImportResult(source)

  if (data.artifacts) data.artifacts.forEach((a, i) => {
    const parsed = parseArtifact(a)
    if (!parsed) result.artifacts.invalid.push(a)
    else result.artifacts.import.push(a)
  })

  if (data.weapons) data.weapons.forEach((w, i) => {
    const parsed = parseWeapon(w)
    if (!parsed) result.weapons.invalid.push(w)
    else result.weapons.import.push(w)
  })

  if (data.characters) data.characters.forEach(c => {
    const parsed = parseCharacter(c)
    if (!parsed) result.characters.invalid.push(c)
    else result.characters.import.push(c)
  })

  if (source === GOSource) {
    result.extra = { buildSettings: [], states: [] }
    const { states, buildSettings } = data as unknown as IGO
    states && states.forEach(s =>
      result.extra!.buildSettings.push({ ...s, builds: [], buildDate: 0, }))
    buildSettings && buildSettings.forEach(b =>
      result.extra!.buildSettings.push({ ...b, builds: [], buildDate: 0, }))
  }
  return result
}
