import type { Candidate } from '@genshin-optimizer/pando/engine'
import { prod, read, sum } from '@genshin-optimizer/pando/engine'
import { buildCount, type Progress } from './common'
import { Worker } from './worker'

test('Worker', () => {
  const readA = read({ q: 'a' }, 'sum')
  const readB = read({ q: 'b' }, 'sum')
  const nodes = [prod(readA, sum(readB, 2))]
  const candidates = [...Array(7)].map((_) => [
    ...[...Array(10)].map(
      (_, i) => ({ id: 't' + i, a: i, b: 10 - i } as any as Candidate<string>)
    ),
    ...[...Array(10)].map(
      (_, i) => ({ id: 'b' + i, a: i, b: 9 - i } as any as Candidate<string>)
    ),
  ])
  const ids = candidates.map((cnds) => cnds.map((c) => c.id))
  const worker = new Worker({
    nodes,
    minimum: [-Infinity],
    candidates,
    topN: 1,
  })

  worker.add([{ ids, count: buildCount(ids) }])
  expect(total(worker.progress)).toEqual(buildCount(ids))

  const report = worker.resetProgress()
  expect(report.computed).toEqual(0) // compute during `worker.compute` only
  let totalProgress = report.skipped
  let rem = report.remaining

  while (worker.hasWork()) {
    worker.compute()

    const report = worker.resetProgress()
    expect(total(report)).toEqual(rem)
    totalProgress += report.computed + report.skipped
    rem = report.remaining
  }

  expect(totalProgress).toEqual(buildCount(ids))
  const { builds } = worker.resetProgress()
  expect(builds[0].value).toEqual(36 * 36)
})

function total(progress: Progress): number {
  return progress.computed + progress.skipped + progress.remaining
}
