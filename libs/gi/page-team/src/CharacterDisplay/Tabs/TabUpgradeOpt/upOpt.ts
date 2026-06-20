import { range } from '@genshin-optimizer/common/util'
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
  deduplicate,
  dustReshape,
  elixirDefinition,
  evalMarkovNode,
  expandNodes,
  levelUpArtifact,
  makeObjective,
} from '@genshin-optimizer/gi/upopt'
import type {
  EvaluatedMarkovNode,
  MarkovNode,
  Objective,
} from '@genshin-optimizer/gi/upopt'
import { type OptNode, precompute } from '@genshin-optimizer/gi/wr'
import { erf } from './mathUtil'

type Build = Record<ArtifactSlotKey, ICachedArtifact | undefined>
type MarkovTree = { p: number; n: MarkovNode }[]
type EvaluatedMarkovTree = {
  result: { p: number; upAvg: number; lower: number; upper: number }
  tree: { p: number; n: EvaluatedMarkovNode }[]
  info: UpOptInfo
  evalMode: MarkovNode['type']
  id: string
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

export class UpOptCalculatorV2 {
  build: Build
  obj: Objective
  candidates: EvaluatedMarkovTree[] = []
  fixedIx = 0

  constructor(
    nodes: OptNode[],
    thresholds: number[],
    build: Build,
    artifacts: ICachedArtifact[],
    reshapeConfig: ReshapeConfig,
    defineConfig: DefineConfig
  ) {
    this.build = build

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

    this.candidates.sort(this.compare)
    this.calcSlowToIndex(5)

    this.calcExact(0)
    console.log('V2', this.candidates)
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
      ...this.evaluateNodes(
        dustReshape(art, this.build, info.affixes, info.mintotal)
      ),
      info,
      evalMode: 'substat' as const,
      id: `${this.candidates.length}`,
    }
  }

  tryDefine({ setKeys, slotKeys, mainStats, substats }: DefineConfig) {
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
        elixirDefinition({ ...info, prob_4line: 1 / 3 }, this.build)
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
    return { tree: evaluated, result: accumulateEvaluations(evaluated) }
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
      arr.sort(this.compare)
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

  calcExact(ix: number) {
    if (ix >= this.fixedIx) this.calcSlowToIndex(ix + 1)
    this.expandRollsLevel(ix)
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

  reCalc(ix: number, art: ICachedArtifact) {
    if (this.candidates[ix].info.type === 'levelUp')
      this.candidates[ix] = this.fromLevelUpInfo(this.candidates[ix].info, art)
    else if (this.candidates[ix].info.type === 'reshape')
      this.candidates[ix] = this.fromReshapeInfo(this.candidates[ix].info, art)
    this.expandSubstatLevel(ix)
  }

  compare(a: EvaluatedMarkovTree, b: EvaluatedMarkovTree) {
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
}

function accumulateEvaluations(
  evaluated: { p: number; n: EvaluatedMarkovNode }[]
) {
  const { p, upAvgAcc, lower, upper } = evaluated.reduce(
    (acc, { p, n: { evaluation } }) => ({
      p: acc.p + p * evaluation.prob,
      upAvgAcc: acc.upAvgAcc + p * evaluation.prob * evaluation.upAvg,
      lower: Math.min(acc.lower, evaluation.lower),
      upper: Math.max(acc.upper, evaluation.upper),
    }),
    { p: 0, upAvgAcc: 0, lower: Infinity, upper: -Infinity }
  )
  return { p, upAvg: p < 1e-6 ? 0 : upAvgAcc / p, lower, upper }
}

export function integralOfGMM(
  a: number,
  b: number,
  { tree }: EvaluatedMarkovTree
) {
  const { int, intCons } = tree.reduce(
    (
      { int, intCons },
      {
        p,
        n: {
          evaluation: {
            constr_prob,
            f_mu: [mu],
            f_cov: [[cov]],
          },
        },
      }
    ) => {
      const sig = Math.sqrt(cov)
      if (sig < 1e-3) {
        if (a <= mu && mu < b)
          return { int: p + int, intCons: constr_prob * p + intCons }
        return { int, intCons }
      }
      const P = erf((mu - a) / sig) - erf((mu - b) / sig)
      return {
        int: int + (p * P) / 2,
        intCons: intCons + (constr_prob * p * P) / 2,
      }
    },
    { int: 0, intCons: 0 }
  )
  return { est: int, estCons: intCons }
}
