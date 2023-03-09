import { Interim, Setup } from "..";
import { OptNode } from "../../Formula/optimization";
import { ArtifactSlotKey } from "@genshin-optimizer/consts";
import { objectKeyValueMap, objectMap } from "../../Util/Util";
import { ArtifactBuildData, ArtifactsBySlot, countBuilds, DynStat, filterArts, pruneAll, RequestFilter } from "../common";
import type { SplitWorker } from "./BackgroundWorker";
import { linearUB } from "./linearUB";

type Approximation = {
  base: number,
  /** optimization target contribution from a given artifact (id) */
  conts: StrictDict<string, number>
}
type Filter = {
  nodes: OptNode[], arts: ArtifactsBySlot
  /**
   * The contribution of each artifact to the optimization target. The (over)estimated
   * optimization target value is the sum of contributions of all artifacts in the build.
   */
  approxs: Approximation[], maxConts: Record<ArtifactSlotKey, number>[]
  /** How many times has this filter been splitted */
  age: number
  /** Total number of builds in this filter */
  count: number
  /** Whether or not this filter is in a valid (calculated) state */
  calculated?: boolean
}
export class BNBSplitWorker implements SplitWorker {
  min: number[]
  nodes: OptNode[]
  arts: ArtifactsBySlot
  topN: number

  /**
   * Filters are not neccessarily in a valid state, i.e., "calculated".
   * We amortize the calculation to 1-per-split so that the calculation
   * overhead doesn't lead to lag.
   */
  filters: Filter[] = []
  interim: Interim | undefined
  firstUncalculated = 0

  callback: (interim: Interim) => void

  constructor({ arts, optTarget, constraints, topN }: Setup, callback: (interim: Interim) => void) {
    this.arts = arts
    this.min = [-Infinity, ...constraints.map(x => x.min)]
    this.nodes = [optTarget, ...constraints.map(x => x.value)]
    this.callback = callback
    this.topN = topN

    // make sure we can approximate it
    linearUB(this.nodes, arts)
  }

  addFilter(filter: RequestFilter): void {
    const arts = filterArts(this.arts, filter), count = countBuilds(arts)
    if (count)
      this.filters.push({ nodes: this.nodes, arts, maxConts: [], approxs: [], age: 0, count })
  }
  setThreshold(newThreshold: number): void {
    if (newThreshold > this.min[0]) {
      this.min[0] = newThreshold
      // All calculations become stale
      this.firstUncalculated = 0
      this.filters.forEach(filter => delete filter.calculated)
    }
  }
  *split(filter: RequestFilter, minCount: number): Generator<RequestFilter> {
    this.addFilter(filter)

    while (this.filters.length) {
      const filter = this.getApproxFilter(), { arts, count } = filter

      if (count <= minCount) {
        if (!count) continue
        if (this.firstUncalculated < this.filters.length)
          this.calculateFilter(this.firstUncalculated++) // Amortize the filter calculation to 1-per-split

        this.reportInterim(false)
        yield objectMap(arts.values, arts => ({ kind: "id" as const, ids: new Set(arts.map(art => art.id)) }))
      } else
        this.splitOldFilter(filter)
    }

    this.reportInterim(true)
  }

  reportInterim(forced = false) {
    if (this.interim && (this.interim.skipped > 1000000 || forced === true)) {
      this.callback(this.interim)
      this.interim = undefined
    }
  }

  splitOldFilter({ nodes, arts, approxs, age }: Filter) {
    /**
     * Split the artifacts in each slot into high/low main (index 0) contribution along 1/3 of the
     * contribution range. If the main contribution of a slot is in range 500-2000, the the high-
     * contibution artifact has contribution of at least 1500, and the rest are low-contribution.
     */
    const splitted = objectMap(arts.values, arts => {
      const remaining = arts.map((art) => ({ art, cont: approxs[0].conts[art.id] }))
        .sort(({ cont: c1 }, { cont: c2 }) => c2 - c1)
      const minCont = remaining[remaining.length - 1]?.cont ?? 0
      let contCutoff = remaining.reduce((accu, { cont }) => accu + cont, -minCont * remaining.length) / 3

      const index = Math.max(1, remaining.findIndex(({ cont }) => (contCutoff -= cont - minCont) <= 0))
      const lowArts = remaining.splice(index).map(({ art }) => art), highArts = remaining.map(({ art }) => art)
      return {
        high: { arts: highArts, maxConts: approxs.map(approx => maxContribution(highArts, approx)), },
        low: { arts: lowArts, maxConts: approxs.map(approx => maxContribution(lowArts, approx)) },
      }
    })
    const remaining = Object.keys(splitted), { filters } = this
    const current: StrictDict<ArtifactSlotKey, ArtifactBuildData[]> = {} as any
    const currentCont: StrictDict<ArtifactSlotKey, number[]> = {} as any
    function partialSplit(count: number) {
      if (!remaining.length) {
        const maxConts = approxs.map((_, i) => objectMap(currentCont, val => val[i]))
        const currentArts = { base: arts.base, values: { ...current } }
        filters.push({ nodes, arts: currentArts, maxConts, approxs, age: age + 1, count })
        return
      }
      const slot = remaining.pop()!, { high, low } = splitted[slot]
      if (low.arts.length) {
        current[slot] = low.arts
        currentCont[slot] = low.maxConts
        partialSplit(count * low.arts.length)
      }
      if (high.arts.length) {
        current[slot] = high.arts
        currentCont[slot] = high.maxConts
        partialSplit(count * high.arts.length)
      }
      remaining.push(slot)
    }
    partialSplit(1)
  }

  /** *Precondition*: `this.filters` must not be empty */
  getApproxFilter(): Filter {
    this.calculateFilter(this.filters.length - 1)
    if (this.firstUncalculated > this.filters.length)
      this.firstUncalculated = this.filters.length
    return this.filters.pop()!
  }
  /** Update calculate on filter at index `i` if not done so already */
  calculateFilter(i: number): void {
    let { nodes, arts, maxConts, approxs, age, count: oldCount, calculated } = this.filters[i]
    if (calculated) return
    if (age < 3 || age % 5 === 2) { // Make sure the condition includes initial filter `age === 0`
      // Either the filter is so early that we can get a good cutoff, or the problem has
      // gotten small enough that the old approximation becomes inaccurate
      ({ nodes, arts } = pruneAll(nodes, this.min, arts, this.topN, {}, { pruneNodeRange: true }))
      if (Object.values(arts.values).every(x => x.length)) {
        approxs = approximation(nodes, arts)
        maxConts = approxs.map(approx => objectMap(arts.values, val => maxContribution(val, approx)))
      }
    }
    // Removing artifacts that doesn't meet the required opt target contributions.
    //
    // We could actually loop `newValues` computation if the removed artifacts have
    // the highest contribution in one of the target node as the removal will raise
    // the required contribution even further. However, once is generally enough.
    const leadingConts = maxConts.map((cont, i) => Object.values(cont)
      .reduce((accu, val) => accu + val, approxs[i].base - this.min[i]))
    const newValues = objectMap(arts.values, (arts, slot) => {
      const requiredConts = leadingConts.map((lc, i) => maxConts[i][slot] - lc)
      return arts.filter(({ id }) => approxs.every(({ conts }, i) => conts[id] >= requiredConts[i]))
    })
    arts = { base: arts.base, values: newValues }
    const newCount = countBuilds(arts)
    if (newCount !== oldCount)
      if (this.interim) this.interim.skipped += oldCount - newCount
      else this.interim = { resultType: "interim", buildValues: undefined, tested: 0, failed: 0, skipped: oldCount - newCount }
    this.filters[i] = { nodes, arts, maxConts, approxs, age, count: newCount, calculated: true }
  }
}

function maxContribution(arts: ArtifactBuildData[], approximation: Approximation): number {
  return Math.max(...arts.map(({ id }) => approximation.conts[id]!))
}
function approximation(nodes: OptNode[], arts: ArtifactsBySlot): Approximation[] {
  return linearUB(nodes, arts).map(weight => ({
    base: dot(arts.base, weight, weight.$c),
    conts: objectKeyValueMap(Object.values(arts.values).flat(),
      data => [data.id, dot(data.values, weight, 0)])
  }))
}
function dot(values: DynStat, lin: DynStat, c: number): number {
  return Object.entries(values).reduce((accu, [k, v]) => accu + (lin[k] ?? 0) * v, c)
}
