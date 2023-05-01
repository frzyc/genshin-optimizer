import type { Interim, Setup } from '../..'
import { optimize, type OptNode } from '../../../Formula/optimization'
import type { ArtifactSetKey, ArtifactSlotKey } from '@genshin-optimizer/consts'
import { allArtifactSetKeys } from '@genshin-optimizer/consts'
import { objectKeyValueMap, objectMap } from '../../../Util/Util'
import type {
  ArtifactBuildData,
  ArtifactsBySlot,
  DynStat,
  RequestFilter,
} from '../../common'
import { countBuilds, filterArts, pruneAll } from '../../common'
import type { SplitWorker } from '../BackgroundWorker'
import type { Linear } from './linearUB'
import { linearUB } from './linearUB'
import { pickSplitKey, splitOnSet, splitAtValue } from './heuristicSplitting'

type Approximation = {
  base: number
  /** optimization target contribution from a given artifact (id) */
  conts: StrictDict<string, number>
}
type Filter = {
  nodes: OptNode[]
  lins: Linear[]
  arts: ArtifactsBySlot
  /**
   * The contribution of each artifact to the optimization target. The (over)estimated
   * optimization target value is the sum of contributions of all artifacts in the build.
   */
  approxs: Approximation[]
  maxConts: Record<ArtifactSlotKey, number>[]
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

  constructor(
    { arts, optTarget, constraints, topN }: Setup,
    callback: (interim: Interim) => void
  ) {
    this.arts = arts
    this.min = [-Infinity, ...constraints.map((x) => x.min)]
    this.nodes = [optTarget, ...constraints.map((x) => x.value)]
    this.callback = callback
    this.topN = topN

    // make sure we can approximate it
    linearUB(this.nodes, arts)
  }

  addFilter(filter: RequestFilter): void {
    const arts = filterArts(this.arts, filter),
      count = countBuilds(arts)
    if (count)
      this.filters.push({
        nodes: this.nodes,
        arts,
        maxConts: [],
        lins: [],
        approxs: [],
        count,
      })
  }
  popFilters(n = 1) {
    n = Math.min(n, this.filters.length - 2)
    return this.filters.splice(0, n).map(({ arts }) =>
      objectMap(arts.values, (arts) => ({
        kind: 'id' as const,
        ids: new Set(arts.map(({ id }) => id)),
      }))
    )
  }
  setThreshold(newThreshold: number): void {
    if (newThreshold > this.min[0]) {
      this.min[0] = newThreshold
      // All calculations become stale
      this.firstUncalculated = 0
      this.filters.forEach((filter) => delete filter.calculated)
    }
  }
  *split(filter: RequestFilter, minCount: number): Generator<RequestFilter> {
    this.addFilter(filter)

    while (this.filters.length) {
      const filter = this.getApproxFilter(),
        { arts, count } = filter

      if (count <= minCount || Object.keys(arts.base).length === 0) {
        if (!count) continue
        if (this.firstUncalculated < this.filters.length)
          this.calculateFilter(this.firstUncalculated++) // Amortize the filter calculation to 1-per-split

        this.reportInterim(false)
        yield objectMap(arts.values, (arts) => ({
          kind: 'id' as const,
          ids: new Set(arts.map((art) => art.id)),
        }))
      } else this.splitOldFilter(filter)
    }

    this.reportInterim(true)
  }

  reportInterim(forced = false) {
    if (this.interim && (this.interim.skipped > 1000000 || forced === true)) {
      this.callback(this.interim)
      this.interim = undefined
    }
  }

  splitOldFilter(filter: Filter) {
    const { nodes, arts, lins } = filter
    if (countBuilds(arts) === 0) return

    const { splitOn, splitVal } = pickSplitKey(lins, arts)
    const newFilters = allArtifactSetKeys.includes(splitOn as any)
      ? splitOnSet(splitOn as ArtifactSetKey, arts)
      : splitAtValue(splitOn, splitVal, arts)

    for (const arts of newFilters) {
      const count = countBuilds(arts)
      this.filters.push({
        nodes,
        arts,
        maxConts: [],
        lins: [],
        approxs: [],
        count,
      })
    }
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
    let { nodes, arts, maxConts, lins, approxs } = this.filters[i]
    const { count: oldCount, calculated } = this.filters[i]
    if (calculated) return
    ;({ nodes, arts } = pruneAll(
      nodes,
      this.min,
      arts,
      this.topN,
      {},
      { pruneNodeRange: true }
    ))
    nodes = optimize(nodes, {}, (_) => false)
    if (Object.values(arts.values).every((x) => x.length)) {
      ;({ lins, approxs } = approximation(nodes, arts))
      maxConts = approxs.map((approx) =>
        objectMap(arts.values, (val) => maxContribution(val, approx))
      )
    }
    // Removing artifacts that doesn't meet the required opt target contributions.
    //
    // We could actually loop `newValues` computation if the removed artifacts have
    // the highest contribution in one of the target node as the removal will raise
    // the required contribution even further. However, once is generally enough.
    const leadingConts = maxConts.map((cont, i) =>
      Object.values(cont).reduce(
        (accu, val) => accu + val,
        approxs[i].base - this.min[i]
      )
    )
    const newValues = objectMap(arts.values, (arts, slot) => {
      const requiredConts = leadingConts.map((lc, i) => maxConts[i][slot] - lc)
      return arts.filter(({ id }) =>
        approxs.every(({ conts }, i) => conts[id] >= requiredConts[i])
      )
    })
    arts = { base: arts.base, values: newValues }
    const newCount = countBuilds(arts)
    if (newCount !== oldCount)
      if (this.interim) this.interim.skipped += oldCount - newCount
      else
        this.interim = {
          resultType: 'interim',
          buildValues: undefined,
          tested: 0,
          failed: 0,
          skipped: oldCount - newCount,
        }
    this.filters[i] = {
      nodes,
      arts,
      maxConts,
      lins,
      approxs,
      count: newCount,
      calculated: true,
    }
  }
}

function maxContribution(
  arts: ArtifactBuildData[],
  approximation: Approximation
): number {
  return Math.max(...arts.map(({ id }) => approximation.conts[id]!))
}
function approximation(
  nodes: OptNode[],
  arts: ArtifactsBySlot
): { lins: Linear[]; approxs: Approximation[] } {
  const lins = linearUB(nodes, arts)
  return {
    lins,
    approxs: lins.map((weight) => ({
      base: dot(arts.base, weight, weight.$c),
      conts: objectKeyValueMap(Object.values(arts.values).flat(), (data) => [
        data.id,
        dot(data.values, weight, 0),
      ]),
    })),
  }
}
function dot(values: DynStat, lin: DynStat, c: number): number {
  return Object.entries(values).reduce(
    (accu, [k, v]) => accu + (lin[k] ?? 0) * v,
    c
  )
}
