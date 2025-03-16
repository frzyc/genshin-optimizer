import type { Candidate as BaseCnd } from '@genshin-optimizer/pando/engine'

export const splitThreshold = 2_000_000 // split if there are more possible builds than this

export type Candidate = BaseCnd<string | number>
export type BuildResult<ID = Candidate['id']> = { value: number; ids: ID[] }
export interface Work {
  ids: Candidate['id'][][] // possible ids for each slot
  count: number // # of possible builds
}

export interface Progress {
  computed: number // # of builds computed
  failed: number // # of (computed) builds that fail some constraints
  skipped: number // # of builds not computed e.g. via pruning
  remaining: number // # of uncomputed and unskipped builds
}

export function buildCount<V>(candidates: V[][]): number {
  return candidates.reduce((num, cnds) => num * cnds.length, 1)
}
