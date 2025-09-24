import { mvnPE_bad } from "./mvncdf";
import type {
  EvaluatedGaussian,
  EvaluatedMarkovNode,
  EvaluatedRollsNode,
  EvaluatedSubstatNode,
  EvaluatedValuesNode,
  GaussianNode,
  MarkovNode,
  Objective,
  RollsLevelNode,
  SubstatLevelNode,
  ValuesLevelNode,
} from "./upOpt.types";

export function evaluateGaussian(
  obj: Objective,
  { base, subs, mu, cov }: GaussianNode,
): EvaluatedGaussian {
  const stats = {
    ...base,
  };
  subs.forEach((s, i) => (stats[s] = (stats[s] ?? 0) + mu[i]));

  const [f_mu, df] = obj.computeWithDerivs(stats);
  // numpy notation:
  // f_cov = df @ cov @ df.T
  const f_cov = df.map((df_i) =>
    df.map((df_j) =>
      subs.reduce(
        (_0, a, ix_a) =>
          _0 +
          subs.reduce((_1, b, ix_b) => {
            const df_ia = df_i[a] ?? 0;
            const df_jb = df_j[b] ?? 0;
            const cov_ab = cov[ix_a][ix_b];
            return _1 + df_ia * cov_ab * df_jb;
          }, 0),
        0,
      ),
    ),
  );
  const {
    p: prob,
    upAvg,
    cp: constr_prob,
  } = mvnPE_bad(f_mu, f_cov, obj.threshold);

  return {
    f_mu,
    f_cov,
    prob,
    constr_prob,
    upAvg,

    lower: upAvg - 4 * Math.sqrt(f_cov[0][0]),
    upper: upAvg + 4 * Math.sqrt(f_cov[0][0]),
  };
}

export function evalMarkovNode(
  obj: Objective,
  node: SubstatLevelNode,
): EvaluatedSubstatNode;
export function evalMarkovNode(
  obj: Objective,
  node: RollsLevelNode,
): EvaluatedRollsNode;
export function evalMarkovNode(
  obj: Objective,
  node: ValuesLevelNode,
): EvaluatedValuesNode;
export function evalMarkovNode(
  obj: Objective,
  node: MarkovNode,
): EvaluatedMarkovNode;
export function evalMarkovNode(
  obj: Objective,
  node: MarkovNode,
): EvaluatedMarkovNode {
  return {
    ...node,
    evaluation: evaluateGaussian(obj, node.subDistr),
  };
}
