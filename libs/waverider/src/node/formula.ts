import type { Lookup, Match, Max, Min, Prod, Subscript, Sum, SumFrac, Threshold } from '../node'

type Arithmetics = Sum | Prod | Min | Max | SumFrac | Subscript
type Branching<Output> = Match<Output> | Threshold<Output> | Lookup<Output>

export const arithmetic: Record<Arithmetics['op'], (x: number[], ex: any) => number> = {
  'sum': x => x.reduce((a, b) => a + b, 0),
  'prod': x => x.reduce((a, b) => a * b, 1),
  'min': x => Math.min(...x),
  'max': x => Math.max(...x),
  'sumfrac': ([x, c]) => x! / (x! + c!),
  'subscript': ([x], table) => table[x!],
}
export const selectBranch: Record<Branching<unknown>['op'], (br: any[], ex: any) => number> = {
  'match': ([v1, v2]) => v1 === v2 ? 0 : 1,
  'thres': ([v1, v2]) => v1 >= v2 ? 0 : 1,
  'lookup': ([v1], table) => table[v1] ?? 0,
}
