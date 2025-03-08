import type { Candidate, NumTagFree } from '@genshin-optimizer/pando/engine'
import { executionStr, prune } from '@genshin-optimizer/pando/engine'
import type { BuildResult, Progress, Work } from './common'
import { buildCount } from './common'
import { splitCandidates } from './split'

const splitThreshold = 2_000_000 // split if there are more possible builds than this
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
  builds: BuildResult[] = []

  progress: Progress = {
    computed: 0,
    failed: 0,
    skipped: 0,
    remaining: 0,
  }

  constructor(cfg: WorkerConfig) {
    this.nodes = cfg.nodes
    this.minimum = cfg.minimum
    this.candidates = cfg.candidates.map(
      (cnds) => new Map(cnds.map((c) => [c.id, c]))
    )
    this.topN = cfg.topN
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

  compute(): void {
    const subwork = this.subworks.pop()
    if (!subwork) return
    this.spreadSubworks()

    const { progress, topN } = this
    const { nodes, minimum, candidates, count } = subwork
    const f = compile(nodes, minimum, topN, 'q', candidates.length)
    const { failed, results } = f(candidates, this.minimum[0])
    progress.computed += count
    progress.failed += failed
    progress.remaining -= count
    this.builds.push(...results)
  }

  setOptThreshold(threshold: number): void {
    this.minimum[0] = threshold
    this.builds = this.builds.filter((b) => b.value >= threshold)
  }

  resetProgress(): { builds: BuildResult[] } & Progress {
    const { progress, topN, builds, minimum } = this
    builds.sort((a, b) => b.value - a.value).splice(topN)
    if (builds.length === topN) minimum[0] = builds[topN - 1].value

    const out = { builds: [...builds], ...progress }
    progress.computed = 0
    progress.failed = 0
    progress.skipped = 0
    return out
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

function compile(
  nodes: NumTagFree[],
  minimum: number[],
  topN: number,
  dynTagCat: string,
  slotCount: number
): (
  candidates: Candidate<string>[][],
  m0: number
) => {
  failed: number
  results: { ids: string[]; value: number }[]
} {
  const slotIds = [...new Array(slotCount)].map((_, i) => i)
  const cnds = slotIds.map((i) => `cnds${i}`) // i0, i1, ..
  const cs = slotIds.map((i) => `c${i}`) // c0, c1, ..

  const { str, names } = executionStr(nodes, 'x', ({ tag }) => {
    const vals = cs.map((c) => `(${c}['${tag[dynTagCat]}']??0)`)
    return `+(${vals.join('+')}+0)`
  })
  const nodeNames = nodes.map((n) => names.get(n)!)
  const constraints = minimum.map((m, i) => !!i && `${m}>${nodeNames[i]}`) // exclude opt threshold
  const ids = cs.map((c) => `${c}['id']`)

  const lenCheck = `if(${cleanThreshold}<out.length){
  out.sort((a,b)=>b.value-a.value).splice(${topN})
  m=out[${topN - 1}].value
}`
  const forEachO = slotIds.map((i) => `for(const c${i} of i${i}){`)
  const forEachC = slotIds.map((i) => (i === 1 ? `}` + lenCheck : `}`))
  const body = `'use strict';
const[${cnds}]=candidates,out=[];let failed=0
${forEachO.join('')}
  const ${str}
  if(${constraints.join('||')}){failed+=1;continue}
  if(m>${names.get(nodes[0])})continue
  out.push({ids:[${ids}],value:${names.get(nodes[0])}})
${forEachC.join()}
}
return{failed,results:out}`
  return new Function('candidates', 'm', body) as any
}
