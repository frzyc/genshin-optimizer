import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import { executionStr } from '@genshin-optimizer/pando/engine'
import type { BuildResult, Candidate, Progress, Work } from './common'
import { splitThreshold } from './common'
import { splitSubwork } from './split'

const cleanThreshold = 3000 // clean results if there are more results than this

export interface WorkerConfig {
  nodes: NumTagFree[]
  minimum: number[]
  candidates: Candidate[][]
  topN: number
}

export type Subwork = {
  nodes: NumTagFree[]
  minimum: number[]
  candidates: Candidate[][]
  count: number
}

export class Worker {
  nodes: NumTagFree[]
  minimum: number[]
  candidates: Map<Candidate['id'], Candidate>[]
  topN: number

  subworks: Subwork[] = []
  builds: BuildResult[] = []

  progress: Progress = { computed: 0, failed: 0, skipped: 0, remaining: 0 }

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
    for (const w of works) progress.remaining += w.count
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

  /** Ensure the last subwork is smaller than `splitThreshold` */
  spreadSubworks(): void {
    const { subworks, minimum } = this
    while (subworks.length) {
      const subwork = subworks.pop()!
      subwork.minimum[0] = minimum[0] // in case the threshold was updated
      const splitted = splitSubwork(subwork, this)
      if (Array.isArray(splitted)) subworks.push(...splitted)
      else {
        subworks.push(splitted)
        return
      }
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
  candidates: Candidate[][],
  m0: number
) => { failed: number; results: BuildResult[] } {
  const slotIds = [...new Array(slotCount)].map((_, i) => i)
  const cnds = slotIds.map((i) => `cnds${i}`) // cnds0, cnds1, ..
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
  const forEachO = slotIds.map((i) => `for(const ${cs[i]} of ${cnds[i]}){`)
  const forEachC = slotIds.map((i) => (i === 1 ? `}${lenCheck}` : '}'))
  const body = `'use strict';
const[${cnds}]=candidates,out=[];let failed=0
${forEachO.join('')}
  const ${str}
  if(${constraints.join('||')}){failed+=1;continue}
  if(m>${names.get(nodes[0])})continue
  out.push({ids:[${ids}],value:${names.get(nodes[0])}})
${forEachC.join('')}
return{failed,results:out}`
  return new Function('candidates', 'm', body) as any
}
