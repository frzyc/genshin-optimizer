import type { IArtifact } from "../Types/artifact"
import type { ICharacter } from "../Types/character"
import type { IWeapon } from "../Types/weapon"

export const GOSource = "Genshin Optimizer" as const

function newCounter<T>(): ImportResultCounter<T> {
  return { import: 0, invalid: [], new: [], update: [], unchanged: [], remove: [], notInImport: 0, beforeMerge: 0 }
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
  states?: object[]
  buildSettings?: object[]
}

export type ImportResultCounter<T> = {
  import: number, // total # in file
  new: T[],
  update: T[], // Use new object
  unchanged: T[], // Use new object
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
