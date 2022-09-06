import type { IArtifact } from "../Types/artifact"
import type { ICharacter } from "../Types/character"
import type { IWeapon } from "../Types/weapon"
import { BuildSetting } from "./Data/BuildsettingData"

export const GOSource = "Genshin Optimizer" as const

function newCounter<T>(): ImportResultCounter<T> {
  return { import: 0, invalid: [], new: [], update: [], unchanged: [], upgraded: [], remove: [], notInImport: 0, beforeMerge: 0 }
}

export function newImportResult(source: string): ImportResult {
  return { type: "GOOD", source, artifacts: newCounter(), weapons: newCounter(), characters: newCounter() }
}
export type IGOOD = {
  format: "GOOD"
  source: string
  version: 1
  characters?: any[]
  artifacts?: any[]
  weapons?: any[]
}
export type IGO = {
  dbVersion: number
  source: typeof GOSource
  states?: Array<object & { key: string }>
  buildSettings?: Array<BuildSetting & { key: string }>
}

export type ImportResultCounter<T> = {
  import: number, // total # in file
  new: T[],
  update: T[], // Use new object
  unchanged: T[], // Use new object
  upgraded: T[],
  remove: T[],
  invalid: T[],
  notInImport: number,
  beforeMerge: number,
}
export type ImportResult = {
  type: "GOOD",
  source: string,
  artifacts: ImportResultCounter<IArtifact>,
  weapons: ImportResultCounter<IWeapon>,
  characters: ImportResultCounter<ICharacter>,
}
