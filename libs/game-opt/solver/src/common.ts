export const MAX_BUILDS = 50_000

export interface BuildResult {
  value: number
  ids: string[]
}

export interface BuildResultByIndex {
  value: number
  indices: number[]
}

export interface ProgressResult {
  numBuildsKept: number
  numBuildsComputed: number
}

// Store metadata in 'id' key
// We will store some index information here, since it needs to be number type
export type EquipmentStats = Record<string, number> & { id: number }
