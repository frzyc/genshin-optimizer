import type { Monotonicity, Range } from '@genshin-optimizer/pando/engine'
import { prune } from '@genshin-optimizer/pando/engine'
import { type Candidate, buildCount, splitThreshold } from './common'
import type { Subwork, Worker } from './worker'

/** split `subwork` into smaller works, or only `prune` it if it is small enough */
export function splitSubwork(
  subwork: Subwork,
  worker: Worker
): Subwork | Subwork[] {
  const { progress, topN } = worker
  let { nodes, minimum, candidates } = subwork
  const pruned = prune(nodes, candidates, 'q', minimum, topN)
  ;({ nodes, minimum, candidates } = pruned)
  const { cndRanges, monotonicities } = pruned
  const count = buildCount(candidates)
  progress.skipped += subwork.count - count
  progress.remaining -= subwork.count - count

  if (!count) return []
  if (count <= splitThreshold) return { nodes, candidates, minimum, count }
  return splitCandidates(candidates, cndRanges, monotonicities).map(
    (candidates) => {
      const count = buildCount(candidates)
      return { nodes, candidates, minimum, count }
    }
  )
}

function splitCandidates(
  candidates: Candidate[][],
  cndRanges: Record<string, Range>[],
  monotonicities: Map<string, Monotonicity>
): Candidate[][][] {
  const incomp: string[] = []
  for (const [k, m] of monotonicities) if (!m.inc && !m.dec) incomp.push(k)
  if (incomp.length) {
    for (let i = 0, len = cndRanges.length; i < len; i++) {
      const ranges = cndRanges[i]
      const s = incomp.find((s) => ranges[s] && ranges[s].min !== ranges[s].max)
      if (s === undefined) continue

      const groups = new Map<any, Candidate[]>()
      for (const c of candidates[i]) {
        const old = groups.get(c[s])
        if (old) old.push(c)
        else groups.set(c[s], [c])
      }
      // Split by the first axis by values of incomp `s`
      return [...groups.values()]
        .sort((a, b) => b.length - a.length) // smaller groups at the back
        .map((cnds) => withSlot(cnds, i, candidates))
    }
  }
  return splitMonotone(candidates, monotonicities)
}

function splitMonotone(
  candidates: Candidate[][],
  monotonicities: Map<string, Monotonicity>
): Candidate[][][] {
  // TODO: this weight favors values with large magnitudes
  const weights = new Map<string, number>()
  for (const [k, { inc, dec }] of monotonicities)
    if (inc) weights.set(k, Math.random())
    else if (dec) weights.set(k, -Math.random())
  const slot = candidates.reduce(
    (best, cnds, i, arr) => (arr[best].length < cnds.length ? i : best),
    0
  )
  const vals = candidates[slot].map((c) => {
    const val = Object.entries(c).reduce(
      (s, [k, v]) => (typeof v === 'number' ? s + v * weights.get(k)! : s),
      0
    )
    return [c, val] as const
  })
  vals.sort((a, b) => a[1] - b[1]) // larger vals at the back
  // Split the slot (roughly) into four equal slots
  const chunkLen = Math.ceil(vals.length / 4)
  const chunks: Candidate[][][] = []
  for (let i = 0; i < vals.length; i += chunkLen) {
    const chunk = vals.slice(i, i + chunkLen).map(([c]) => c)
    chunks.push(withSlot(chunk, slot, candidates))
  }
  return chunks
}

function withSlot(
  cnds: Candidate[],
  slot: number,
  candidates: Candidate[][]
): Candidate[][] {
  candidates = [...candidates]
  candidates[slot] = cnds
  return candidates
}
