import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import { allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import { type OptNode, optimize } from '@genshin-optimizer/gi/wr'
import type {
  ArtifactBuildData,
  ArtifactsBySlot,
  DynStat,
  RequestFilter,
} from '../../common.js'
import { countBuilds, filterArts, pruneAll } from '../../common.js'
import type { Interim, Setup } from '../../type.js'
import type { SplitWorker } from '../BackgroundWorker.js'
import { pruneDominance } from './diffBound.js'
import { pickSplitKey, splitAtValue, splitOnSet } from './heuristicSplitting.js'
import type { Linear } from './linearUB.js'
import { linearUB } from './linearUB.js'

type Approximation = {
  base: number
  /** optimization target contribution from a given artifact (id) */
  conts: Record<string, number>
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
  /** Swap-dominance pruning discards builds that could still populate plot
   * bins, so it must stay off when plotting. */
  canPruneDominance: boolean
  /** Per-artifact cap on swap-dominance candidates tested (sorted
   * best-first); keeps `pruneDominance` roughly linear per slot on repeated
   * filter passes. */
  maxDominanceCandidates = 32
  /** Only run swap-dominance pruning on filters at least this large; smaller
   * filters don't repay the bound evaluations. */
  minDominanceCount = 1 << 16
  /**
   * Index of `plotBase` in `nodes` when plotting. The plot must show the
   * Pareto frontier of (plotBase, optTarget), so regions below the opt-target
   * threshold may only be pruned if they are also below `plotThreshold` in
   * plotBase — i.e., only when they are Pareto-dominated by a known top-N
   * build (whose plotBase value is `plotThreshold`, sent by `GOSolver`).
   * Pruning on the threshold alone would truncate the frontier's extrema.
   */
  plotNodeIdx: number | undefined
  plotThreshold = Number.NEGATIVE_INFINITY

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
    { arts, optTarget, constraints, topN, plotBase }: Setup,
    callback: (interim: Interim) => void
  ) {
    this.arts = arts
    this.min = [Number.NEGATIVE_INFINITY, ...constraints.map((x) => x.min)]
    this.nodes = [optTarget, ...constraints.map((x) => x.value)]
    if (plotBase) {
      this.plotNodeIdx = this.nodes.length
      this.nodes.push(plotBase)
      this.min.push(Number.NEGATIVE_INFINITY)
    }
    this.callback = callback
    this.topN = topN
    this.canPruneDominance = !plotBase

    // make sure we can approximate it (incl. `plotBase`; on failure the
    // caller falls back to `DefaultSplitWorker`, which never prunes)
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
  setThreshold(newThreshold: number, plotThreshold?: number): void {
    let stale = false
    if (newThreshold > this.min[0]) {
      this.min[0] = newThreshold
      stale = true
    }
    if (plotThreshold !== undefined && plotThreshold !== this.plotThreshold) {
      this.plotThreshold = plotThreshold
      stale = true
    }
    if (stale) {
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
        yield objMap(arts.values, (arts) => ({
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
    // `pruneAll` prunes each node against its minimum independently, which
    // cannot express the (objective AND plot) domination condition, so when
    // plotting the opt-target threshold must not be applied there.
    const pruneMin =
      this.plotNodeIdx === undefined
        ? this.min
        : [Number.NEGATIVE_INFINITY, ...this.min.slice(1)]
    ;({ nodes, arts } = pruneAll(
      nodes,
      pruneMin,
      arts,
      this.topN,
      {},
      { pruneNodeRange: true }
    ))
    nodes = optimize(nodes, {}, (_) => false)
    if (Object.values(arts.values).every((x) => x.length)) {
      if (this.canPruneDominance && countBuilds(arts) > this.minDominanceCount)
        arts = pruneDominance(
          nodes,
          arts,
          this.topN,
          this.maxDominanceCandidates
        ).arts
      const data = approximation(nodes, arts)
      lins = data.lins
      approxs = data.approxs
      maxConts = approxs.map((approx) =>
        objMap(arts.values, (val) => maxContribution(val, approx))
      )
    }
    // Removing artifacts that doesn't meet the required opt target contributions.
    //
    // We could actually loop `newValues` computation if the removed artifacts have
    // the highest contribution in one of the target node as the removal will raise
    // the required contribution even further. However, once is generally enough.
    const plotIdx = this.plotNodeIdx
    const reqMins =
      plotIdx === undefined
        ? this.min
        : this.min.map((m, i) => (i === plotIdx ? this.plotThreshold : m))
    const leadingConts = maxConts.map((cont, i) =>
      Object.values(cont).reduce(
        (accu, val) => accu + val,
        approxs[i].base - reqMins[i]
      )
    )
    const newValues = objMap(arts.values, (arts, slot) => {
      const requiredConts = leadingConts.map((lc, i) => maxConts[i][slot] - lc)
      if (plotIdx === undefined || !approxs.length)
        return arts.filter(({ id }) =>
          approxs.every(({ conts }, i) => conts[id] >= requiredConts[i])
        )
      // When plotting, keep everything that could be on the Pareto frontier
      // of (plotBase, optTarget): hard constraints must still hold, but the
      // opt-target threshold may only remove an artifact when its best-case
      // plotBase value is also below `plotThreshold` — otherwise its builds
      // are not necessarily dominated by the top-N build that set the
      // thresholds, and pruning would clip the frontier's extrema.
      return arts.filter(
        ({ id }) =>
          approxs.every(
            ({ conts }, i) =>
              i === 0 || i === plotIdx || conts[id] >= requiredConts[i]
          ) &&
          (approxs[0].conts[id] >= requiredConts[0] ||
            approxs[plotIdx].conts[id] >= requiredConts[plotIdx])
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
      conts: objKeyValMap(Object.values(arts.values).flat(), (data) => [
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
