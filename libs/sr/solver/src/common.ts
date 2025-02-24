import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'

export const MAX_BUILDS = 50_000

export interface BuildResult {
  value: number
  lightConeId: string
  relicIds: Record<RelicSlotKey, string>
}

export interface BuildResultByIndex {
  value: number
  lightConeIndex: number
  relicIndices: Record<RelicSlotKey, number>
}

export interface ProgressResult {
  numBuildsKept: number
  numBuildsComputed: number
}

// Store metadata in 'id' key
// We will store some index information here, since it needs to be number type
export type EquipmentStats = Record<string, number> & { id: number }
