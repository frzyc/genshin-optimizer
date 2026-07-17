import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { optimize } from '@genshin-optimizer/gi/wr'
import type {
  FutureArtifactProfile,
  PartialBuildsData,
  PartialBuildsSetup,
} from '../common.js'
import {
  computeArtRange,
  mergePartialCandidates,
  pruneAll,
  pruneExclusion,
} from '../common.js'
import { WorkerCoordinator } from '../coordinator.js'
import type {
  Count,
  FinalizeResult,
  Interim,
  OptProblemInput,
  Setup,
  WorkerCommand,
  WorkerResult,
} from '../type.js'

export class GOSolver extends WorkerCoordinator<WorkerCommand, WorkerResult> {
  private maxIterateSize = 32_000_000
  private status: Record<
    | 'tested'
    | 'failed'
    | 'skipped'
    | 'total'
    | 'testedPerSecond'
    | 'skippedPerSecond',
    number
  > & {
    /** set when the post-solve partial-build tighten pass starts; persists
     * after the solve so the UI can keep reporting the pass */
    phase?: 'tighten'
    tightenStartTime?: number
  }
  private exclusion: Count['exclusion']
  private topN: number
  private buildValues: { w: Worker; val: number; plot?: number }[]
  private finalizedResults: FinalizeResult[] = []
  private plotting: boolean
  private plotThreshold = Number.NEGATIVE_INFINITY
  private tracksPartials = false
  /** Tight partial builds with witnesses, per requested slot; populated by
   * `solve()` when `OptProblemInput.partialBuilds` was given. */
  partialBuilds: PartialBuildsData | undefined

  constructor(
    problem: OptProblemInput,
    status: GOSolver['status'],
    numWorker: number
  ) {
    const workers = Array(numWorker)
      .fill(Number.NaN)
      .map(
        (_) =>
          new Worker(new URL('./BackgroundWorker.ts', import.meta.url), {
            type: 'module',
          })
      )
    super(workers, ['iterate', 'split', 'count', 'tighten'], (r, w) => {
      switch (r.resultType) {
        case 'interim':
          this.interim(r, w)
          break
        case 'finalize':
          this.finalizedResults.push(r)
          break
        case 'tighten':
          this.partialBuilds = r.partialBuilds
          break
        case 'count':
          this.status.total = r.count
          break
        case 'err':
          this.onError(r)
          break
      }
    })
    const { exclusion, topN } = problem
    this.status = status
    this.exclusion = exclusion
    this.topN = topN
    this.plotting = !!problem.plotBase
    this.status.total = Number.NaN
    this.status.testedPerSecond = 0
    this.status.skippedPerSecond = 0
    this.buildValues = Array(topN).fill({
      w: undefined as any,
      val: Number.NEGATIVE_INFINITY,
    })

    const setup = this.preprocess(problem)
    this.tracksPartials = !!setup.partialBuilds
    this.notifiedBroadcast(setup)
  }

  async solve() {
    const { exclusion, maxIterateSize } = this
    this.finalizedResults = []

    // Cleanup function from the BPS tracker
    const stopTracking = this.trackBuildsPerSecond()

    await this.execute([{ command: 'count', exclusion, maxIterateSize }])
    stopTracking()
    this.notifiedBroadcast({ command: 'finalize' })
    await this.execute([])
    if (this.tracksPartials) {
      // Winnow the merged candidates to the tight witnessed set, in a single
      // worker (it holds the original-space snapshot from setup).
      this.status.phase = 'tighten'
      this.status.tightenStartTime = performance.now()
      const candidates = mergePartialCandidates(
        this.finalizedResults.map((r) => r.partialCandidates ?? {})
      )
      const threshold = this.buildValues[0]?.val ?? Number.NEGATIVE_INFINITY
      await this.execute([{ command: 'tighten', candidates, threshold }])
    }
    return this.finalizedResults
  }

  preprocess({
    plotBase,
    optimizationTarget,
    arts,
    topN,
    exclusion,
    constraints,
    partialBuilds,
  }: OptProblemInput): Setup {
    constraints = constraints.filter((x) => x.min > Number.NEGATIVE_INFINITY)
    if (partialBuilds && !Object.keys(partialBuilds).length)
      partialBuilds = undefined
    if (partialBuilds && plotBase)
      throw new Error('plotBase and partialBuilds are mutually exclusive')

    let nodes = [...constraints.map((x) => x.value), optimizationTarget]
    const minimums = [
      ...constraints.map((x) => x.min),
      Number.NEGATIVE_INFINITY,
    ]
    if (plotBase) {
      nodes.push(plotBase)
      minimums.push(Number.NEGATIVE_INFINITY)
    }

    nodes = pruneExclusion(nodes, exclusion)
    nodes = optimize(nodes, {}, (_) => false)

    // Partial builds are tracked in this *original* stat space: `pruneAll`
    // below reaffines dyn keys, but future-artifact profiles and their
    // witnesses only make sense in real stat keys. Workers join the two
    // spaces by artifact id.
    const bundle: PartialBuildsSetup | undefined = partialBuilds && {
      profiles: Object.fromEntries(
        Object.entries(partialBuilds).map(([slot, profiles]) => [
          slot,
          profiles?.length
            ? profiles
            : [
                // Fallback for an empty request: a current-inventory profile,
                // so re-checking an owned artifact stays covered. Its box is
                // coarse (no roll structure), so witnesses from it are only
                // box geometry — callers wanting realistic certificates
                // should pass explicit profiles instead.
                {
                  fixed: {},
                  substats: computeArtRange(
                    arts.values[slot as ArtifactSlotKey]
                  ),
                  maxSubstats: Number.POSITIVE_INFINITY,
                } satisfies FutureArtifactProfile,
              ],
        ])
      ),
      nodes: [nodes[nodes.length - 1], ...nodes.slice(0, -1)],
      mins: [Number.NEGATIVE_INFINITY, ...minimums.slice(0, -1)],
      arts,
    }
    ;({ nodes, arts } = pruneAll(nodes, minimums, arts, topN, exclusion, {
      reaffine: true,
      pruneArtRange: true,
      pruneNodeRange: true,
      pruneOrder: true,
    }))
    nodes = optimize(nodes, {}, (_) => false)

    if (plotBase) plotBase = nodes.pop()
    const optTarget = nodes.pop()!

    return {
      command: 'setup',
      arts,
      optTarget,
      plotBase,
      topN,
      partialBuilds: bundle,
      constraints: nodes.map((value, i) => ({ value, min: minimums[i] })),
    }
  }

  /** Tracks number of builds processed per second. Returns a cleanup function to be called once Artifact Optimization is complete. */
  private trackBuildsPerSecond() {
    let lastTime = performance.now()
    let lastTested = 0
    let lastSkipped = 0

    let intervalId: NodeJS.Timeout | null = null
    const cleanup = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    try {
      intervalId = setInterval(() => {
        const currentTime = performance.now()
        const elapsedTime = (currentTime - lastTime) / 1000 // in seconds
        const testedDifference = this.status.tested - lastTested
        const skippedDifference = this.status.skipped - lastSkipped

        if (elapsedTime !== 0) {
          this.status.testedPerSecond = testedDifference / elapsedTime
          this.status.skippedPerSecond = skippedDifference / elapsedTime
        }

        lastTime = currentTime
        lastTested = this.status.tested
        lastSkipped = this.status.skipped
      }, 1000)
    } catch (e) {
      cleanup()
      throw e
    }

    // Return a cleanup function to stop the interval
    return cleanup
  }

  /** Returns a new `threshold` if altered */
  private interim(r: Interim, worker: Worker) {
    this.status.tested += r.tested
    this.status.failed += r.failed
    this.status.skipped += r.skipped

    if (r.buildValues) {
      const { topN } = this,
        oldThreshold =
          this.buildValues[topN - 1].val ?? Number.NEGATIVE_INFINITY

      this.buildValues = this.buildValues.filter(({ w }) => w !== worker)
      this.buildValues.push(
        ...r.buildValues.map((val, i) => ({
          w: worker!,
          val,
          plot: r.buildPlots?.[i],
        }))
      )
      this.buildValues.sort((a, b) => b.val - a.val).splice(topN)

      const threshold =
        this.buildValues[topN - 1].val ?? Number.NEGATIVE_INFINITY
      let changed = oldThreshold !== threshold
      let plotThreshold: number | undefined
      if (this.plotting) {
        // Each top-N build is a certified frontier dominator point
        // (plot, value >= threshold); regions may only be threshold-pruned
        // when their plotBase upper bound also falls below this.
        plotThreshold = this.buildValues.reduce(
          (a, { plot }) => Math.max(a, plot ?? Number.NEGATIVE_INFINITY),
          Number.NEGATIVE_INFINITY
        )
        if (plotThreshold !== this.plotThreshold) {
          this.plotThreshold = plotThreshold
          changed = true
        }
      }
      if (changed)
        this.broadcast({ command: 'threshold', threshold, plotThreshold })
    }
  }
}
