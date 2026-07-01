import { prod, read } from '@genshin-optimizer/pando/engine'
import {
  prepareBatchedSolverConfig,
  unionCandidates,
  workFromCandidates,
} from './batch'
import type { SolverSharedConfig } from './batch'

const readA = read({ q: 'a' }, 'sum')
const nodes = [prod(readA, 2)]

const shared: SolverSharedConfig<string> = {
  nodes,
  minimum: [-Infinity],
  topN: 1,
  numWorkers: 2,
  setProgress: () => {},
}

function candidates(
  slot0: { id: string; a: number }[],
  slot1: { id: string; a: number }[]
) {
  return [slot0, slot1]
}

test('workFromCandidates returns null for empty pools', () => {
  expect(workFromCandidates([[], [{ id: 'b0', a: 1 }]])).toBeNull()
})

test('prepareBatchedSolverConfig merges work units', () => {
  const sliceA = candidates(
    [
      { id: 'a0', a: 1 },
      { id: 'a1', a: 2 },
    ],
    [{ id: 'b0', a: 3 }]
  )
  const sliceB = candidates(
    [{ id: 'a2', a: 4 }],
    [
      { id: 'b1', a: 5 },
      { id: 'b2', a: 6 },
    ]
  )
  const works = [sliceA, sliceB]
    .map(workFromCandidates)
    .filter((w): w is NonNullable<typeof w> => !!w)
  const union = unionCandidates([sliceA, sliceB])
  const merged = prepareBatchedSolverConfig(shared, works, union)

  expect(merged).toBeDefined()
  expect(merged!.initialWorks).toHaveLength(2)
  expect(
    merged!.initialWorks!.every((w) => w.count > 0 && w.ids.length === 2)
  ).toBe(true)
  expect(merged!.numWorkers).toEqual(2)
  expect(merged!.candidates[0]).toHaveLength(3)
  expect(merged!.candidates[1]).toHaveLength(3)
})
