import type { SubstatKey } from "@genshin-optimizer/gi/consts";
import type { DynStat } from "@genshin-optimizer/gi/solver";

export type GaussianMixture = {
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
}

export type GaussianNode = {
  base: DynStat;
  subs: SubstatKey[];
  mu: number[];    // Mean stats vector
  cov: number[][]; // Covariance of stats matrix
};

export type EvaluatedGaussian = {
  f_mu: number[];      // f(mu)
  f_cov: number[][];   // Covariance of f(X)
  prob: number;        // P[X >= x]
  constr_prob: number; // P[X[1:] >= x[1:]]
  upAvg: number;       // E[X[0] | X >= x]

  // Left & right bounds for visualization
  lower: number;
  upper: number;
};

export type MarkovNode = SubstatLevelNode | RollsLevelNode | ValuesLevelNode;
export type SubstatLevelNode = {
  type: "substat";
  subDistr: GaussianNode;
  evaluation?: EvaluatedGaussian;

  // Information for constructing children (Rolls level)
  base: DynStat;
  subkeys: SubstatKey[];
  rollsLeft: number;
  // reshape: boolean;  // Dust of enlightenment reshaping - warps rolls distributions. IDK how it works.
};

export type RollsLevelNode = {
  type: "rolls";
  subDistr: GaussianNode;
  evaluation?: EvaluatedGaussian;

  // Information for constructing children (Values level)
  base: DynStat;
  subs: { key: SubstatKey; rolls: number }[];
};

export type ValuesLevelNode = {
  type: "values";
  subDistr: GaussianNode;
  evaluation?: EvaluatedGaussian;

  base: DynStat;
};
