import type { Candidate, NumTagFree } from '@genshin-optimizer/pando/engine'
import { compiledStr, customOps, prune } from '@genshin-optimizer/pando/engine'
import type { BuildResult, Progress, Work } from './common'
import { buildCount } from './common'
import { splitCandidates } from './split'

const splitThreshold = 200_000 // split if there are more possible builds than this
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

    const { progress, topN } = this
    const { nodes, minimum, candidates, count } = subwork
    minimum[0] = this.minimum[0] // in case the threshold was updated
    const f = compileProcess(nodes, minimum, topN, 'q', candidates.length)
    const { failed, results } = f(candidates)
    progress.computed += count
    progress.failed += failed
    progress.remaining -= count
    this.results.push(...results)
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

function compileProcess(
  nodes: NumTagFree[],
  minimum: number[],
  topN: number,
  dynTagCat: string,
  slotCount: number
): (candidates: Candidate<string>[][]) => {
  failed: number
  results: { ids: string[]; value: number }[]
} {
  const slotIds = [...new Array(slotCount)].map((_, i) => i)
  const cnds = slotIds.map((i) => `i${i}`) // i0, i1, ..
  const cs = slotIds.map((i) => `c${i}`) // c0, c1, ..
  let body = `'use strict';const[${cnds}]=candidates,out=[];let m=${minimum[0]},failed=0;`
  for (const [name, f] of Object.entries(customOps))
    body += `,f${name}=${f.calc.toString()}` // custom ops `f{name}`
  for (let i = 0; i < slotCount; i++) body += `for(const c${i} of i${i})`

  const { str, names } = compiledStr(nodes, 'x', ({ tag }) => {
    const vals = cs.map((c) => `(${c}['${tag[dynTagCat]}']??0)`)
    return `+(${vals.join('+')}+0)`
  })

  // constraint checks and pass/fail logic
  const nodeNames = nodes.map((n) => names.get(n)!)
  const constraints = minimum.map((m, i) => !!i && `${m}>${nodeNames[i]}`) // exclude opt threshold
  const ids = cs.map((c) => `${c}['id']`)
  body += `{const _=0${str};
  if(${constraints.join('||')}){failed+=1;continue}
  if(m>${names.get(nodes[0])})continue;
  if(${cleanThreshold}<out.push({ids:[${ids}],value:${names.get(nodes[0])}})){
    out.sort((a,b)=>b.value-a.value).splice(${topN})
    m=out[${topN - 1}].value
  }}return{failed,results:out}`
  return new Function('candidates', body) as any
}
