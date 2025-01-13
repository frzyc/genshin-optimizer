import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'

export const MAX_BUILDS = 50_000

export type DiscStats = {
  id: string
  stats: Record<string, number>
}

export type BaseStats = Record<string, number>

export type Constraints = Record<string, { value: number; isMax: boolean }>

export interface BuildResult {
  value: number
  // lightConeId: string
  discIds: Record<DiscSlotKey, string>
}
