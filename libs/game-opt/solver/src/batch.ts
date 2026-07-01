import type { Candidate } from '@genshin-optimizer/pando/engine'
import { prune } from '@genshin-optimizer/pando/engine'
import { buildCount, type Work } from './common'
import type { SolverConfig } from './solver'
import { Solver } from './solver'

/** Invariant solver inputs shared across batched work units. */
export type SolverSharedConfig<ID extends string | number> = Pick<
  SolverConfig<ID>,
  'nodes' | 'minimum' | 'topN' | 'numWorkers' | 'setProgress'
>

export function workFromCandidates<ID extends string | number>(
  candidates: Candidate<ID>[][]
): Work | null {
  const count = buildCount(candidates)
  if (!count) return null
  return {
    ids: candidates.map((cnds) => cnds.map((c) => c.id)),
    count,
  }
}

/** Union candidate pools per slot (deduped by id). */
export function unionCandidates<ID extends string | number>(
  slices: Candidate<ID>[][][]
): Candidate<ID>[][] {
  if (!slices.length) return []
  const maps = slices[0].map(() => new Map<ID, Candidate<ID>>())
  for (const candidates of slices) {
    candidates.forEach((slot, i) => {
      slot.forEach((c) => maps[i].set(c.id, c))
    })
  }
  return maps.map((m) => [...m.values()])
}

/** Build one solver config: shared formula + queued works + union candidate pool. */
export function prepareBatchedSolverConfig<ID extends string | number>(
  shared: SolverSharedConfig<ID>,
  works: Work[],
  union: Candidate<ID>[][]
): SolverConfig<ID> | null {
  if (!works.length) return null

  const prunedUnion = prune(
    shared.nodes,
    union,
    'q',
    shared.minimum,
    shared.topN
  )

  return {
    ...shared,
    nodes: prunedUnion.nodes,
    minimum: prunedUnion.minimum,
    candidates: union,
    workerCandidates: union,
    initialWorks: works,
    initialSkipped: 0,
  }
}

export function createBatchedSolver<ID extends string | number>(
  shared: SolverSharedConfig<ID>,
  works: Work[],
  union: Candidate<ID>[][]
): Solver<ID> | null {
  const cfg = prepareBatchedSolverConfig(shared, works, union)
  if (!cfg) return null
  return new Solver(cfg)
}
