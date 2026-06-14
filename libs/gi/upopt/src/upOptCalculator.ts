import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { evalMarkovNode } from './markov-tree/evaluation'

import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import { makeSlotObjectives } from './buildObjective'
import { deduplicate } from './deduplicate'
import { expandNode, levelUpArtifact } from './upOpt'
import type { Build, MarkovNode } from './upOpt.types'

/**
 * Artifact upgrade distribution math summary.
 *
 * Let A be the upgrade distribution of some artifact `art0`. We write
 *  art ~ A to say `art` is a random artifact drawn from the
 *  upgrade distribution `A`.
 * With f(art) being damage function of the 1-swap of an artifact,
 *  we write dmg ~ f(A) to say `dmg` is a random number sampled by
 *  the process:  art ~ A ; dmg = f(art)
 *
 * To approximate f(A), we take the linear approximation of upgrade
 *  distribution of an artifact.
 *           L(art) = f(art0) + sum_i ∂f/∂x_i * s_i * RV_i
 *       L(art)  - Linear approximation of damage function
 *       ∂f/∂x_i - derivative of f wrt substat i (at art0)
 *       s_i     - "scale" of substat i
 *       RV_i    - roll value of substat i
 * Let k_i = ∂f/∂x_i * s_i below.
 *
 * The roll value is the sum of n_i uniform distributions {7, 8, 9, 10}.
 *  We approximate it with a Normal distribution:
 *          RV_i = N[ 8.5n_i, 1.25n_i ]
 *     n_i - number of upgrades for substat i
 * Magic numbers µ = 17/2 and ν = 5/4 come from the mean & std.dev of RV.
 *
 * The substat upgrades are chosen uniform randomly per roll, so
 *  the n_i follow a multinomial distribution. So the linearized
 *  dmg distribution `L(A)` can be written:
 *    L(A) = sum σ(n1, n2, n3, n4) * (f(art0) + sum_i k_i * RV_i(n_i))
 *          σ(n1, n2, n3, n4) - Multinomial distribution for upgrade numbers
 *                              with total n1 + n2 + n3 + n4 = N
 *  where the first sum is over the (n1, n2, n3, n4) of the multinomial
 *  distribution.
 *
 * =========== SLOW APPROXIMATION ==========
 * Because L(A) is written as the sum of Normal distributions, we
 *  can write it as a Gaussian Mixture. We can perform probability
 *  queries following ordinary Gaussian Mixture methods.
 * Note that in the code, `art0` is chosen as a function of n_i to
 *  account for the guaranteed stats due to the number of rolls.
 *
 * =========== FAST APPROXIMATION ==========
 * The Fast method approximates the slow Mixture distribution by matching
 *  the 1st and 2nd moments. This is not expected to be a good approximation;
 *  it's only useful for a ball-park estimate of the upgrade probability.
 * Note that in here, `art0` is fixed wrt n_i.
 *  mean of L(A) = f(art0) + sum_i mean(n_i) * µ k_i
 *  variance of L(A) = sum_i (mean(n_i)/4 * ν k_i^2 + N/4 (µ k_i)^2)
 *                     - N * (sum_i µ/4 k_i)^2
 *                   = N * (Q * sum_i k_i^2 - W * (sum_i k_i)^2)
 *            where Q = (ν + µ^2)/4 and W = (µ / 4)^2
 */
export enum ResultType {
  Fast,
  Slow,
  Exact,
}

export type UpOptResult = {
  p: number
  upAvg: number
  distr: GaussianMixture
  evalMode: ResultType
}

export type UpOptArtifact = {
  id: string
  result?: UpOptResult
}

type GaussianMixture = {
  gmm: {
    phi: number // Item weight; must sum to 1.
    cp: number // Constraint probability
    mu: number
    sig2: number
  }[]

  // Store estimates of left and right bounds of distribution for visualization.
  lower: number
  upper: number
}

type WeightedMarkovNode = { p: number; n: MarkovNode }
type Frontier = 'substat' | 'rolls' | 'values'
type ArtifactState = UpOptArtifact & {
  sourceArt: ICachedArtifact
  slotKey: ArtifactSlotKey
  nodes: WeightedMarkovNode[]
  frontier: Frontier
}

export class UpOptCalculator {
  private readonly equippedBuild: Build
  private readonly objectives: ReturnType<typeof makeSlotObjectives>['objectives']
  private readonly updateEquippedArtifact: (art: ICachedArtifact) => void

  thresholds: number[]
  artifacts: ArtifactState[] = []
  fixedIx = 0

  constructor(
    nodes: OptNode[],
    thresholds: number[],
    equippedBuild: Build,
    artifacts: ICachedArtifact[]
  ) {
    this.equippedBuild = equippedBuild
    this.thresholds = thresholds
    const { objectives, updateEquippedArtifact } = makeSlotObjectives(
      nodes,
      thresholds,
      equippedBuild
    )
    this.objectives = objectives
    this.updateEquippedArtifact = updateEquippedArtifact

    this.artifacts = artifacts.map((art) => ({
      id: art.id,
      sourceArt: art,
      slotKey: art.slotKey,
      nodes: levelUpArtifact(art, equippedBuild),
      frontier: 'substat' as const,
    }))

    this.initCalc()
  }

  reCalc(ix: number, art: ICachedArtifact) {
    if (art.id === this.equippedBuild[art.slotKey]?.id) {
      this.equippedBuild[art.slotKey] = art
      this.updateEquippedArtifact(art)
    }
    this.artifacts[ix] = {
      id: art.id,
      sourceArt: art,
      slotKey: art.slotKey,
      nodes: levelUpArtifact(art, this.equippedBuild),
      frontier: 'substat',
    }
    this.calcFast(ix)
  }

  /** Calcs all artifacts using Fast method */
  initCalc() {
    this.artifacts.forEach((_, i) => this.calcFast(i))
    // do slow calc for the first page
    this.calcSlowToIndex(5)
    this.artifacts = this.artifacts.filter((a) => scoreArtifact(a) > 0)
    this.artifacts.sort(compareArtifacts)
    this.fixedIx = 0
  }

  calcSlowToIndex(ix: number, lookahead = 5) {
    const fixedList = this.artifacts.slice(0, this.fixedIx)
    const arr = this.artifacts.slice(this.fixedIx)

    // Assume `fixedList` is all slowEval'd.
    let i = 0
    const end = Math.min(ix - this.fixedIx + lookahead, arr.length)
    do {
      for (; i < end; i++) this.calcSlow(this.fixedIx + i)

      arr.sort(compareArtifacts)
      this.artifacts = [...fixedList, ...arr]
      for (i = 0; i < end; i++) {
        if (arr[i].result!.evalMode === ResultType.Fast) break
      }
    } while (i < end)
  }

  /**
   * Evaluates artifact using Fast method.
   * Selection details based on artifacts[ix]
   */
  calcFast(ix: number) {
    const art = this.artifacts[ix]
    art.result = this.toGaussianResult(art, ResultType.Fast)
  }

  /** Selects evaluation method based on details of artifacts[ix] */
  calcSlow(ix: number) {
    const art = this.artifacts[ix]
    if (art.frontier === 'values') return
    if (art.frontier === 'substat') {
      this.expandFrontier(art)
    }
    art.result = this.toGaussianResult(art, ResultType.Slow)
    this.applyRawSlowBounds(art)
  }

  /**
   * Evaluates artifact using Exact method.
   * Selection details based on artifacts[ix]
   */
  calcExact(ix: number) {
    const art = this.artifacts[ix]
    let nodes = levelUpArtifact(art.sourceArt, this.equippedBuild)
    nodes = expandWeightedNodes(nodes)
    nodes = expandWeightedNodes(nodes)
    art.result = this.toExactResult({ ...art, nodes })
    art.result.distr.gmm = normalizeExactGmm(art.result.distr.gmm)
  }

  private expandFrontier(art: ArtifactState) {
    art.nodes = deduplicate(
      this.objectives[art.slotKey],
      expandWeightedNodes(art.nodes)
    )
    art.frontier = art.frontier === 'substat' ? 'rolls' : 'values'
  }

  private applyRawSlowBounds(art: ArtifactState) {
    if (!art.result) return
    const rawRollsArt = {
      ...art,
      nodes: expandWeightedNodes(
        levelUpArtifact(art.sourceArt, this.equippedBuild)
      ),
    }
    const rawRollsResult = this.toGaussianResult(rawRollsArt, ResultType.Slow)
    art.result.distr.lower = rawRollsResult.distr.lower
    art.result.distr.upper = rawRollsResult.distr.upper
  }

  private toGaussianResult(
    art: ArtifactState,
    evalMode: ResultType
  ): UpOptResult {
    let ptot = 0
    let upAvgtot = 0
    const gmm = art.nodes.map(({ p, n }) => {
      const { evaluation } = evalMarkovNode(this.objectives[art.slotKey], n)
      ptot += p * evaluation.prob
      upAvgtot += p * evaluation.prob * evaluation.upAvg
      return {
        phi: p,
        cp: evaluation.constr_prob,
        mu: evaluation.f_mu[0],
        sig2: Math.max(evaluation.f_cov[0][0] ?? 0, 0),
      }
    })

    const lowers = gmm.map(({ mu, sig2 }) => mu - 4 * Math.sqrt(sig2))
    const uppers = gmm.map(({ mu, sig2 }) => mu + 4 * Math.sqrt(sig2))
    return {
      p: ptot,
      upAvg: ptot < 1e-6 ? 0 : upAvgtot / ptot,
      distr: {
        gmm,
        lower: Math.min(...lowers, this.thresholds[0]),
        upper: Math.max(...uppers, this.thresholds[0]),
      },
      evalMode,
    }
  }

  /**
   * Convert Exact method numbers to Result type.
   *
   * Exact results have no variance, so we can directly check each upgrade branch
   *   to compute the exact probability and upgrade value.
   */
  private toExactResult(art: ArtifactState): UpOptResult {
    let ptot = 0
    let upAvgtot = 0
    const objective = this.objectives[art.slotKey]
    const gmm = art.nodes.map(({ p, n }) => {
      const [val] = objective.computeWithDerivs(n.subDistr.base)
      if (val.every((vi, i) => vi >= this.thresholds[i])) {
        ptot += p
        upAvgtot += p * (val[0] - this.thresholds[0])
        return { phi: p, cp: 1, mu: val[0], sig2: 0 }
      }
      const consOK = val.slice(1).every((vi, i) => vi >= this.thresholds[i + 1])
      return { phi: p, cp: consOK ? 1 : 0, mu: val[0], sig2: 0 }
    })

    const vals = gmm.map(({ mu }) => mu)
    return {
      p: ptot,
      upAvg: ptot < 1e-6 ? 0 : upAvgtot / ptot,
      distr: { gmm, lower: Math.min(...vals), upper: Math.max(...vals) },
      evalMode: ResultType.Exact,
    }
  }
}

function expandWeightedNodes(
  nodes: WeightedMarkovNode[]
): WeightedMarkovNode[] {
  return nodes.flatMap(({ p, n }) =>
    expandNode(n).map(({ p: p2, n: expanded }) => ({
      p: p * p2,
      n: expanded,
    }))
  )
}

function scoreArtifact(a: UpOptArtifact) {
  return a.result!.p * a.result!.upAvg
}

function compareArtifacts(a: UpOptArtifact, b: UpOptArtifact) {
  if (scoreArtifact(a) > 1e-5 || scoreArtifact(b) > 1e-5)
    return scoreArtifact(b) - scoreArtifact(a)

  const meanA = a.result!.distr.gmm.reduce(
    (pv, { phi, mu }) => pv + phi * mu,
    0
  )
  const meanB = b.result!.distr.gmm.reduce(
    (pv, { phi, mu }) => pv + phi * mu,
    0
  )
  return meanB - meanA
}

function normalizeExactGmm(
  gmm: { phi: number; cp: number; mu: number; sig2: number }[],
  precision = 12
) {
  const aggregated = new Map<
    string,
    { phi: number; cp: number; mu: number; sig2: number }
  >()
  gmm.forEach((entry) => {
    const mu = Number(entry.mu.toFixed(precision))
    const key = `${entry.cp}|${mu}|${entry.sig2}`
    const prev = aggregated.get(key)
    if (prev) prev.phi += entry.phi
    else aggregated.set(key, { ...entry, mu })
  })
  return [...aggregated.values()]
}
