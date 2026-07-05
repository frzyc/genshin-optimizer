import { linspace, range } from '@genshin-optimizer/common/util'
import {
  type ArtifactSetKey,
  type ArtifactSlotKey,
  type MainStatKey,
  type SubstatKey,
  allSubstatKeys,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { ArtifactBuildData } from '@genshin-optimizer/gi/solver'
import { compactArtifacts } from '@genshin-optimizer/gi/solver-tc'
import {
  accumulateEvaluation,
  deduplicate,
  dustReshape,
  elixirDefinition,
  evalMarkovNode,
  expandNode,
  expandNodes,
  levelUpArtifact,
  makeObjective,
} from '@genshin-optimizer/gi/upopt'
import type {
  EvaluatedMarkovNode,
  MarkovNode,
  Objective,
} from '@genshin-optimizer/gi/upopt'
import { type OptNode, optimize, precompute } from '@genshin-optimizer/gi/wr'
import { removeSetKeys } from './formulaUtils'
import { erf } from './mathUtil'

type Build = Record<ArtifactSlotKey, ICachedArtifact | undefined>
type MarkovTree = { p: number; n: MarkovNode }[]
type EvaluatedMarkovTree = {
  result: { p: number; upAvg: number; lower: number; upper: number }
  tree: { p: number; n: EvaluatedMarkovNode }[]
  info: UpOptInfo
  evalMode: MarkovNode['type']
  id: string
  chartData?: {
    left: number
    right: number
    bins: number
    data: { x: number; est: number; estCons: number }[]
  }
}

type ReshapeConfig = {
  enabled: boolean
  minTotal: 2 | 3 | 4
}
type DefineConfig = {
  enabled: boolean
  setKeys: ArtifactSetKey[]
  slotKeys: ArtifactSlotKey[]
  mainStats: MainStatKey[]
  substats: SubstatKey[]
}

type LevelUpInfo = {
  artifactId: string
  type: 'levelUp'
}
type ReshapeInfo = {
  artifactId: string
  type: 'reshape'
  affixes: SubstatKey[]
  mintotal: number
}
type DefineInfo = {
  type: 'definition'
  setKey: ArtifactSetKey
  slotKey: ArtifactSlotKey
  mainStatKey: MainStatKey
  affixes: SubstatKey[]
}
export type UpOptInfo = LevelUpInfo | ReshapeInfo | DefineInfo

function canLevelUp(art: ICachedArtifact) {
  // Restricted to 5* artifacts for now.
  return art.level < 20 && art.rarity === 5
}

export function canReshape(art: ICachedArtifact) {
  if (art.rarity !== 5 || art.level !== 20) return false
  if (art.substats.some(({ initialValue }) => initialValue === undefined))
    return false
  return true
}

/** Yield control back to the browser so it can paint between work chunks. */
function yieldToUi() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}
const uiYieldBudgetMs = 12
function shouldYieldToUi(lastYield: number) {
  return Date.now() - lastYield >= uiYieldBudgetMs
}

export class UpOptCalculatorV2 {
  build: Build
  obj: Objective
  candidates: EvaluatedMarkovTree[] = []
  fixedIx = 0

  /** Serializes exact-calc work so candidates are refined one at a time. */
  private exactQueue: Promise<unknown> = Promise.resolve()

  constructor(
    nodes: OptNode[],
    thresholds: number[],
    build: Build,
    artifacts: ICachedArtifact[],
    reshapeConfig: ReshapeConfig,
    defineConfig: DefineConfig
  ) {
    this.build = build
    // Remove setKey thresholds that are always active/inactive, then optimize the formula tree.
    nodes = removeSetKeys(nodes, build)
    nodes = optimize(nodes, {})

    // Populate threshold[0] with current value. It's a bit convoluted :/
    const buildAsList = Object.values(build).filter((v) => v !== undefined)
    const artsBySlot = compactArtifacts(buildAsList, 0, false)
    const evalFn = precompute(nodes, artsBySlot.base, (f) => f.path[1], 5)
    const baseBuild = Object.values(artsBySlot.values).map((v) =>
      v.length > 0 ? v[0] : { id: '', values: {} }
    )
    thresholds[0] = evalFn(baseBuild as ArtifactBuildData[] & { length: 5 })[0]

    // Create objective function & set up candidates.
    this.obj = makeObjective(nodes, thresholds)
    artifacts.forEach((art) => {
      this.tryLevelUp(art)
      if (reshapeConfig.enabled) this.tryReshape(art, reshapeConfig.minTotal)
    })
    if (defineConfig.enabled) this.tryDefine(defineConfig)

    this.candidates = this.candidates.filter((c) => c.result.p > 1e-6)
    this.candidates.sort(compare)
    this.calcSlowToIndex(5)
  }

  tryLevelUp(art: ICachedArtifact) {
    if (!canLevelUp(art)) return
    const info: LevelUpInfo = { artifactId: art.id, type: 'levelUp' }
    this.candidates.push(this.fromLevelUpInfo(info, art))
  }

  fromLevelUpInfo(info: LevelUpInfo, art: ICachedArtifact) {
    return {
      ...this.evaluateNodes(levelUpArtifact(art, this.build)),
      info,
      evalMode: 'substat' as const,
      id: `${this.candidates.length}`,
    }
  }

  tryReshape(art: ICachedArtifact, mintotal: number) {
    if (!canReshape(art)) return
    const substatKeys = art.substats
      .map(({ key }) => key)
      .filter((key) => key !== '')

    const ixPairs = range(0, substatKeys.length - 1).flatMap((i) =>
      range(i + 1, substatKeys.length - 1).map((j) => [i, j] as const)
    )
    ixPairs.forEach(([i, j]) => {
      const affixes = [substatKeys[i], substatKeys[j]]
      const info: ReshapeInfo = {
        artifactId: art.id,
        type: 'reshape',
        affixes,
        mintotal,
      }
      this.candidates.push(this.fromReshapeInfo(info, art))
    })
  }

  fromReshapeInfo(info: ReshapeInfo, art: ICachedArtifact) {
    return {
      ...this.evaluateNodes(dustReshape({ art, ...info }, this.build)),
      info,
      evalMode: 'substat' as const,
      id: `${this.candidates.length}`,
    }
  }

  tryDefine({ setKeys, slotKeys, mainStats, substats }: DefineConfig) {
    setKeys = setKeys.filter((setKey) => this.obj.allReadKeys.includes(setKey))
    if (!setKeys.length) {
      console.warn(
        'No useful set keys available for definition; picking Glad as default'
      )
      setKeys = ['GladiatorsFinale'] // Default to something so user sees some results
    }
    setKeys.forEach((setKey) => {
      slotKeys.forEach((slotKey) => {
        artSlotMainKeys[slotKey]
          .filter((mainStat) => mainStats.includes(mainStat))
          .forEach((mainStatKey) => {
            const subOptions = allSubstatKeys
              .filter((substat) => substat !== mainStatKey)
              .filter((substat) => substats.includes(substat))
            for (let i = 0; i < subOptions.length; i++) {
              for (let j = i + 1; j < subOptions.length; j++) {
                const affixes = [subOptions[i], subOptions[j]]
                const info: DefineInfo = {
                  type: 'definition',
                  setKey,
                  slotKey,
                  mainStatKey,
                  affixes,
                }
                this.candidates.push(this.fromDefineInfo(info))
              }
            }
          })
      })
    })
  }

  fromDefineInfo(info: DefineInfo) {
    return {
      ...this.evaluateNodes(
        elixirDefinition({ ...info, prob_4line: 0.34 }, this.build)
      ),
      info,
      evalMode: 'substat' as const,
      id: `${this.candidates.length}`,
    }
  }

  evaluateNodes(nodes: MarkovTree) {
    nodes = deduplicate(this.obj, nodes)
    const evaluated = nodes.map(({ p, n }) => ({
      p,
      n: evalMarkovNode(this.obj, n),
    }))
    return { tree: evaluated, result: accumulateEvaluation(evaluated) }
  }

  calcSlowToIndex(ix: number, lookahead = 5) {
    const fixedList = this.candidates.slice(0, this.fixedIx)

    // Assume `fixedList` is all expanded.
    let i = 0
    const end = Math.min(
      ix - this.fixedIx + lookahead,
      this.candidates.length - this.fixedIx
    )
    do {
      for (; i < end; i++) this.expandSubstatLevel(this.fixedIx + i)

      const arr = this.candidates.slice(this.fixedIx)
      arr.sort(compare)
      this.candidates = [...fixedList, ...arr]
      for (i = 0; i < end; i++) {
        if (arr[i].evalMode === 'substat') break
      }
    } while (i < end)
    this.fixedIx = ix
  }

  expandSubstatLevel(ix: number) {
    if (this.candidates[ix].evalMode !== 'substat') return
    const newTree = expandNodes(this.candidates[ix].tree)
    const newEval = this.evaluateNodes(newTree)
    this.candidates[ix] = {
      ...this.candidates[ix],
      ...newEval,
      evalMode: 'rolls',
    }
  }

  /**
   * Background (cooperative) version of the exact calc. Expands the candidate's
   * tree down to value level and evaluates it, yielding to the UI periodically
   * so the main thread stays responsive. `shouldCancel` lets the caller abort
   * in-flight work (e.g. when paging away). Returns false if cancelled.
   *
   * Calls are serialized through `exactQueue` so candidates are refined one at a
   * time (sequentially) rather than all starting at once.
   */
  calcExactAsync(
    ix: number,
    histInfo: { left: number; right: number; bins: number },
    shouldCancel: () => boolean = () => false
  ) {
    const run = this.exactQueue.then(() => {
      if (shouldCancel()) return false
      if (ix >= this.fixedIx) this.calcSlowToIndex(ix + 1)
      return this.expandRollsLevelAsync(ix, shouldCancel).then((success) => {
        if (!success) return false
        this.histogram(ix, histInfo)
        return true
      })
    })
    // Keep the chain alive even if a run rejects, so later calls still proceed.
    this.exactQueue = run.catch(() => {})
    return run
  }

  expandRollsLevel(ix: number) {
    if (this.candidates[ix].evalMode !== 'rolls') return
    const newTree = expandNodes(this.candidates[ix].tree)
    const newEval = this.evaluateNodes(newTree)
    this.candidates[ix] = {
      ...this.candidates[ix],
      ...newEval,
      evalMode: 'values',
    }
  }

  async expandRollsLevelAsync(ix: number, shouldCancel: () => boolean) {
    if (this.candidates[ix].evalMode !== 'rolls') return true
    let lastYield = Date.now()

    // Chunked expansion: rolls-level tree -> value-level tree.
    const expanded: MarkovTree = []
    const tree = this.candidates[ix].tree
    for (let i = 0; i < tree.length; i++) {
      const { p, n } = tree[i]
      for (const { p: p2, n: n2 } of expandNode(n))
        expanded.push({ p: p * p2, n: n2 })
      if (shouldYieldToUi(lastYield)) {
        if (shouldCancel()) return false
        await yieldToUi()
        lastYield = Date.now()
      }
    }
    if (shouldCancel()) return false

    // Chunked evaluation (mirrors evaluateNodes, but yielding).
    // const deduped = deduplicate(this.obj, expanded)
    const deduped = expanded // TODO: make dedup work w/ async yield so it doesn't hang UI
    const evaluated: { p: number; n: EvaluatedMarkovNode }[] = []
    for (let i = 0; i < deduped.length; i++) {
      const { p, n } = deduped[i]
      evaluated.push({ p, n: evalMarkovNode(this.obj, n) })
      if (shouldYieldToUi(lastYield)) {
        if (shouldCancel()) return false
        await yieldToUi()
        lastYield = Date.now()
      }
    }
    if (shouldCancel()) return false

    this.candidates[ix] = {
      id: this.candidates[ix].id,
      tree: evaluated,
      result: accumulateEvaluation(evaluated),
      evalMode: 'values',
      info: this.candidates[ix].info,
    }
    return true
  }

  reCalc(ix: number, art: ICachedArtifact) {
    const prevId = this.candidates[ix].id
    if (this.candidates[ix].info.type === 'levelUp')
      this.candidates[ix] = this.fromLevelUpInfo(this.candidates[ix].info, art)
    else if (this.candidates[ix].info.type === 'reshape')
      this.candidates[ix] = this.fromReshapeInfo(this.candidates[ix].info, art)
    else
      console.warn('Unexpected candidate info type; skipping recalc', {
        info: this.candidates[ix].info,
      })

    this.candidates[ix].id = prevId
    this.expandSubstatLevel(ix)
  }

  histogram(
    ix: number,
    { left, right, bins }: { left: number; right: number; bins: number }
  ) {
    const art = this.candidates[ix]
    if (
      art.chartData &&
      art.chartData.left === left &&
      art.chartData.right === right &&
      art.chartData.bins === bins
    ) {
      return art.chartData.data
    }
    const artGMM = art.tree.map(({ p, n }) => ({
      p,
      cp: n.evaluation.constr_prob,
      mu: n.evaluation.f_mu[0],
      sig: Math.sqrt(n.evaluation.f_cov[0][0]),
    }))

    const thr0 = this.obj.threshold[0]
    function perc(x: number) {
      return (100 * (x - thr0)) / thr0
    }
    function integrals(a: number, b: number) {
      let est = 0,
        estCons = 0
      artGMM.forEach(({ p, cp, mu, sig }) => {
        if (sig < 1e-3) {
          if (mu >= a && mu <= b) {
            est += p
            estCons += cp * p
          }
          return
        }
        const P = erf((mu - a) / sig) - erf((mu - b) / sig)
        est += (p * P) / 2
        estCons += (cp * p * P) / 2
      }, 0)
      return { est, estCons }
    }
    const step = (right - left) / bins
    const hist = linspace(left, right, bins, false).flatMap((v) => {
      const { est, estCons } = integrals(v, v + step)
      return [
        { x: perc(v), est, estCons },
        { x: perc(v + step), est, estCons },
      ]
    })
    hist.unshift({ x: perc(left), est: 0, estCons: 0 })
    hist.push({ x: perc(right), est: 0, estCons: 0 })
    this.candidates[ix].chartData = { left, right, bins, data: hist }
    return hist
  }
}

function compare(a: EvaluatedMarkovTree, b: EvaluatedMarkovTree) {
  const scoreA = a.result.p * a.result.upAvg
  const scoreB = b.result.p * b.result.upAvg
  if (scoreA > 1e-5 || scoreB > 1e-5) return scoreB - scoreA

  const meanA = a.tree.reduce(
    (acc, { p, n }) => acc + p * n.evaluation.f_mu[0],
    0
  )
  const meanB = b.tree.reduce(
    (acc, { p, n }) => acc + p * n.evaluation.f_mu[0],
    0
  )
  return meanB - meanA
}
