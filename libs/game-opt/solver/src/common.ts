import type { Candidate } from '@genshin-optimizer/pando/engine'

export const MAX_BUILDS = 50_000

export interface BuildResult {
  value: number
  ids: string[]
}

export interface ProgressResult {
  numBuildsKept: number
  numBuildsComputed: number
}

// Store metadata in 'id' key
export type EquipmentStats = Candidate<string>
