export type BuildResult<ID = string> = { value: number; ids: ID[] }
export interface Work {
  ids: string[][] // possible ids for each slot
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
