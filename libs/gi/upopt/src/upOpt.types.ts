import type { ArtifactRarity, SubstatKey } from '@genshin-optimizer/gi/consts'
import type { DynStat } from '@genshin-optimizer/gi/solver'
import type {
  EvaluatedGaussian,
  GaussianNode,
} from './markov-tree/markov.types'

export type MarkovNode = SubstatLevelNode | RollsLevelNode | ValuesLevelNode
export type EvaluatedMarkovNode =
  | EvaluatedSubstatNode
  | EvaluatedRollsNode
  | EvaluatedValuesNode
export type SubstatLevelNode = {
  type: 'substat'
  subDistr: GaussianNode

  // Information for constructing children (Rolls level)
  base: DynStat
  rarity: ArtifactRarity
  subkeys: { key: SubstatKey; baseRolls: number }[]
  rollsLeft: number
  reshape?: { affixes: SubstatKey[]; mintotal: number } // Dust of enlightenment reshaping - warps rolls distributions.
}
export type EvaluatedSubstatNode = SubstatLevelNode & {
  evaluation: EvaluatedGaussian
}

export type RollsLevelNode = {
  type: 'rolls'
  subDistr: GaussianNode

  // Information for constructing children (Values level)
  base: DynStat
  rarity: ArtifactRarity
  subs: { key: SubstatKey; rolls: number }[]
}
export type EvaluatedRollsNode = RollsLevelNode & {
  evaluation: EvaluatedGaussian
}

export type ValuesLevelNode = {
  type: 'values'
  subDistr: GaussianNode
}
export type EvaluatedValuesNode = ValuesLevelNode & {
  evaluation: EvaluatedGaussian
}
