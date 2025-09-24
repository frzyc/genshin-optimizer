import type { ArtifactRarity, SubstatKey } from "@genshin-optimizer/gi/consts";
import type { DynStat } from "@genshin-optimizer/gi/solver";

export type GaussianMixtureResult = {
  gmm: {
    weight: number; // Item weight; must sum to 1.
    constr_prob: number; // Constraint probability
    mu: number;
    sig2: number;
  }[];
  // Store estimates of left and right bounds of distribution for visualization.
  lower: number;
  upper: number;
};

export type Objective = {
  computeWithDerivs: (x: DynStat) => [number[], DynStat[]];
  threshold: number[];
  zeroDeriv: SubstatKey[]; // Substats that have zero derivative for all objective functions.
};

export type GaussianNode = {
  base: DynStat;
  subs: SubstatKey[];
  mu: number[]; // Mean stats vector
  cov: number[][]; // Covariance of stats matrix
};

export type EvaluatedGaussian = {
  f_mu: number[]; // f(mu)
  f_cov: number[][]; // Covariance of f(X)
  prob: number; // P[X >= x]
  constr_prob: number; // P[X[1:] >= x[1:]]
  upAvg: number; // E[X[0] | X >= x]

  // Left & right bounds for visualization
  lower: number;
  upper: number;
};

export type MarkovNode = SubstatLevelNode | RollsLevelNode | ValuesLevelNode;
export type EvaluatedMarkovNode =
  | EvaluatedSubstatNode
  | EvaluatedRollsNode
  | EvaluatedValuesNode;
export type SubstatLevelNode = {
  type: "substat";
  subDistr: GaussianNode;

  // Information for constructing children (Rolls level)
  base: DynStat;
  rarity: ArtifactRarity;
  subkeys: { key: SubstatKey; baseRolls: number }[];
  rollsLeft: number;
  reshape?: { affixes: SubstatKey[]; mintotal: number }; // Dust of enlightenment reshaping - warps rolls distributions.
};
export type EvaluatedSubstatNode = SubstatLevelNode & {
  evaluation: EvaluatedGaussian;
};

export type RollsLevelNode = {
  type: "rolls";
  subDistr: GaussianNode;

  // Information for constructing children (Values level)
  base: DynStat;
  rarity: ArtifactRarity;
  subs: { key: SubstatKey; rolls: number }[];
};
export type EvaluatedRollsNode = RollsLevelNode & {
  evaluation: EvaluatedGaussian;
};

export type ValuesLevelNode = {
  type: "values";
  subDistr: GaussianNode;
};
export type EvaluatedValuesNode = ValuesLevelNode & {
  evaluation: EvaluatedGaussian;
};
