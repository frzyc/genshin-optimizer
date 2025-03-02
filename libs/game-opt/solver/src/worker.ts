import type { Candidate, NumTagFree } from '@genshin-optimizer/pando/engine'
import { compile, prune } from '@genshin-optimizer/pando/engine'
import type { BuildResult, Counters, Work } from './common'
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

  works: Work[] = []
  subworks: Subwork[] = []
  results: BuildResult[] = []

  counters: Counters = {
    computed: 0,
    failed: 0,
    skipped: 0,
    remaining: 0,
  }

  constructor(cfg: WorkerConfig) {
    this.candidates = cfg.candidates.map(
      (cnds) => new Map(cnds.map((c) => [c.id, c]))
    )
    this.nodes = cfg.nodes
    this.minimum = cfg.minimum
    this.topN = cfg.topN
  }

  add(works: Work[]) {
    works.forEach((w) => (this.counters.remaining += w.count))
    this.works.push(...works)
  }

  steal(maxKeep: number): Work[] {
    const { works, subworks, counters } = this
    let quota = counters.remaining - maxKeep // steal a little more than this
    if (quota <= 0) return []

    let numSteal = works.findIndex((w) => (quota -= w.count) <= 0) + 1
    if (numSteal) {
      counters.remaining = maxKeep + quota
      return works.splice(0, numSteal)
    }

    numSteal = subworks.findIndex((w) => (quota -= w.count) <= 0) + 1
    const extra = subworks.splice(0, numSteal || subworks.length)
    const stealing = [
      ...works,
      ...extra.map(({ candidates, count }) => ({
        ids: candidates.map((cnds) => cnds.map((c) => c.id)),
        count,
      })),
    ]
    this.works = []
    counters.remaining = maxKeep + quota
    return stealing
  }

  hasWork(): boolean {
    return !!(this.subworks.length || this.works.length)
  }

  process(): void {
    const { counters } = this
    const subwork = this.getSubwork()
    if (!subwork) return

    const { nodes, minimum, candidates, count } = subwork
    const f = compile(nodes, 'q', candidates.length, {})
    for (const build of allBuilds(candidates)) {
      const vals = f(build)
      // exclude `i === 0` as it is the opt-target, not an actual constraint
      if (minimum.some((m, i) => i && vals[i] < m)) {
        counters.failed += 1
        continue
      }
      if (vals[0] >= minimum[0])
        this.results.push({ value: vals[0], ids: build.map((b) => b.id) })
    }
    counters.computed += count
    counters.remaining -= count
    // NOTE: if workers are using too much memory, move this into the loop (after push)
    if (this.results.length > cleanThreshold) this.clean()
  }

  setOptThreshold(threshold: number) {
    this.minimum[0] = threshold
    this.results = this.results.filter((b) => b.value >= threshold)
  }

  progress(): { builds: BuildResult[] } & Counters {
    this.clean()
    const counters = this.counters
    const result = { builds: [...this.results], ...counters }
    counters.computed = 0
    counters.failed = 0
    counters.skipped = 0
    return result
  }

  clean() {
    this.results.sort((a, b) => b.value - a.value).splice(this.topN)
    if (this.results.length >= this.topN)
      this.minimum[0] = this.results[this.topN - 1].value
  }

  getSubwork(): Subwork | undefined {
    const { works, subworks, counters } = this
    if (!subworks.length) {
      const { ids, count } = works.pop() ?? {}
      if (count === undefined) return
      const candidates = ids!.map((ids, i) =>
        ids.map((id) => this.candidates[i].get(id)!)
      )
      subworks.push({
        nodes: this.nodes,
        minimum: this.minimum,
        candidates,
        count,
      })
    }

    let subwork: Subwork | undefined
    while ((subwork = subworks.pop()!)) {
      subwork.minimum[0] = this.minimum[0] // in case threshold was updated
      const { nodes, candidates, minimum, cndRanges, monotonicities } = prune(
        subwork.nodes,
        subwork.candidates,
        'q',
        subwork.minimum,
        this.topN
      )

      const count = buildCount(candidates)
      counters.skipped += subwork.count - count
      counters.remaining -= subwork.count - count
      if (!count) continue
      if (count <= splitThreshold) return { nodes, minimum, candidates, count }
      subworks.push(
        ...splitCandidates(candidates, cndRanges, monotonicities).map(
          (candidates) => {
            const count = buildCount(candidates)
            return { nodes, candidates, minimum, count }
          }
        )
      )
    }
    return undefined
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
