import type { Candidate, NumTagFree } from '@genshin-optimizer/pando/engine'
import { compile, prune } from '@genshin-optimizer/pando/engine'
import type { BuildResult, Progress, Work } from './common'
import { buildCount } from './common'
import { splitCandidates } from './split'

const splitThreshold = 20_000 // split if there are more possible builds than this
const cleanThreshold = 3000 // clean results if there are more results than this

export interface WorkerConfig {
  nodes: NumTagFree[]
  minimum: number[]
  candidates: Candidate<string>[][]
  topN: number
}

type Subwork = {
  nodes: NumTagFree[]
  minimum: number[]
  candidates: Candidate<string>[][]
  count: number
}

export class Worker {
  nodes: NumTagFree[]
  minimum: number[]
  candidates: Map<string, Candidate<string>>[]
  topN: number

  subworks: Subwork[] = []
  results: BuildResult[] = []

  progress: Progress = {
    computed: 0,
    failed: 0,
    skipped: 0,
    remaining: 0,
  }

  constructor(cfg: WorkerConfig) {
    this.nodes = cfg.nodes
    this.minimum = cfg.minimum
    this.topN = cfg.topN
    this.candidates = cfg.candidates.map(
      (cnds) => new Map(cnds.map((c) => [c.id, c]))
    )
  }

  add(works: Work[]): void {
    const { subworks, progress, candidates } = this
    works.forEach((w) => (progress.remaining += w.count))
    subworks.unshift(
      ...works.map(({ ids, count }) => ({
        nodes: this.nodes,
        minimum: this.minimum,
        candidates: ids.map((ids, slot) =>
          ids.map((id) => candidates[slot].get(id)!)
        ),
        count,
      }))
    )
    if (subworks.length === works.length) this.spreadSubworks()
  }

  steal(maxKeep: number): Work[] {
    const { subworks, progress } = this
    maxKeep = Math.floor(Math.max(maxKeep, splitThreshold))
    let quota = progress.remaining - maxKeep // steal a little more than this
    if (quota <= 0) return []

    const stealLen = subworks.findIndex((w) => (quota -= w.count) <= 0) + 1
    const stealing = subworks.splice(0, stealLen || subworks.length)
    progress.remaining = maxKeep + quota
    return stealing.map(({ candidates, count }) => ({
      ids: candidates.map((cnds) => cnds.map((c) => c.id)),
      count,
    }))
  }

  hasWork(): boolean {
    return !!this.subworks.length
  }

  process(): void {
    const subwork = this.subworks.pop()
    if (!subwork) return
    this.spreadSubworks()

    const { progress, results } = this
    const { nodes, minimum, candidates, count } = subwork
    minimum[0] = this.minimum[0] // in case the threshold was updated
    const f = compile(nodes, 'q', candidates.length, {})
    for (const build of allBuilds(candidates)) {
      const vals = f(build)
      // exclude `i === 0` as it is the opt-target, not an actual constraint
      if (minimum.some((m, i) => i && vals[i] < m)) progress.failed += 1
      else if (vals[0] >= minimum[0])
        results.push({ value: vals[0], ids: build.map((b) => b.id) })
    }
    progress.computed += count
    progress.remaining -= count
    if (results.length > cleanThreshold) this.clean()
  }

  setOptThreshold(threshold: number): void {
    this.minimum[0] = threshold
    this.results = this.results.filter((b) => b.value >= threshold)
  }

  resetProgress(): { builds: BuildResult[] } & Progress {
    this.clean()
    const { progress } = this
    const result = { builds: [...this.results], ...progress }
    progress.computed = 0
    progress.failed = 0
    progress.skipped = 0
    return result
  }

  clean(): void {
    this.results.sort((a, b) => b.value - a.value).splice(this.topN)
    if (this.results.length === this.topN)
      this.minimum[0] = this.results[this.topN - 1].value
  }

  /** Ensure the last subwork is `pruned` and smaller than `splitThreshold` */
  spreadSubworks(): void {
    const { subworks, progress } = this
    while (subworks.length) {
      const subwork = subworks.pop()!
      subwork.minimum[0] = this.minimum[0] // in case the threshold was updated

      const { nodes, candidates, minimum, cndRanges, monotonicities } = prune(
        subwork.nodes,
        subwork.candidates,
        'q',
        subwork.minimum,
        this.topN
      )
      const count = buildCount(candidates)
      progress.skipped += subwork.count - count
      progress.remaining -= subwork.count - count

      if (!count) continue
      if (count <= splitThreshold) {
        subworks.push({ nodes, candidates, minimum, count })
        return
      }
      subworks.push(
        ...splitCandidates(candidates, cndRanges, monotonicities).map(
          (candidates) => {
            const count = buildCount(candidates)
            return { nodes, candidates, minimum, count }
          }
        )
      )
    }
  }
}

// Recursively generate all builds from given candidates
function* allBuilds<V>(
  candidates: V[][],
  out: V[] = Array(candidates.length),
  idx: number = candidates.length - 1
): Generator<V[]> {
  if (idx === -1) return yield out
  for (const c of candidates[idx]) {
    out[idx] = c
    yield* allBuilds(candidates, out, idx - 1)
  }
}
