import type { IArtifact } from "../Types/artifact"
import type { ICharacter } from "../Types/character"
import type { IWeapon } from "../Types/weapon"
import type { DBStorage } from "./DBStorage"

export const GOSource = "Genshin Optimizer" as const

export function newCounter<T>(): ImportResultCounter<T> {
  return { total: 0, invalid: [], new: [], updated: [], unchanged: [], removed: [], }
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
  total: number, // total # in file
  new: T[],
  updated: T[], // Use new object
  unchanged: T[], // Use new object
  removed: T[],
  invalid: T[],
}
export type ImportResult = {
  type: "GOOD",
  storage: DBStorage,
  source: string,
  artifacts?: ImportResultCounter<IArtifact>,
  weapons?: ImportResultCounter<IWeapon>,
  characters?: ImportResultCounter<ICharacter>,
}
