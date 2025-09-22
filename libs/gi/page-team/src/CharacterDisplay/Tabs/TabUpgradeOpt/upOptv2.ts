import { cartesian, range } from "@genshin-optimizer/common/util";
import type { ArtifactBuildData, DynStat } from "@genshin-optimizer/gi/solver";

import { mvnPE_bad } from "./mvncdf";
import type {
  EvaluatedGaussian,
  GaussianNode,
  Objective,
  RollsLevelNode,
  SubstatLevelNode,
  ValuesLevelNode,
} from "./upOptv2.types";
import { quadrinomial } from "./mathUtil";
import {
  ddx,
  optimize,
  precompute,
  zero_deriv,
  type OptNode,
} from "@genshin-optimizer/gi/wr";
import { allSubstatKeys } from "@genshin-optimizer/gi/consts";

export function makeObjective(
  nodes: OptNode[],
  threshold: number[],
): Objective {
  const nonzeroDerivs = nodes.map((n) =>
    allSubstatKeys.filter((s) => !zero_deriv(n, (f) => f.path[1], s)),
  );

  // Jacobian of nodes w.r.t. all substats; rows: nodes, cols: substats
  const jac = nodes.map((n, i) =>
    nonzeroDerivs[i].map((sub) => ddx(n, (f) => f.path[1], sub)),
  );
  const allNodes = optimize(
    [...nodes, ...jac.flat()],
    {},
    ({ path: [p] }) => p !== "dyn",
  );
  const evalFn = precompute(allNodes, {}, (f) => f.path[1], 1);

  return {
    threshold,
    computeWithDerivs: (x: DynStat) => {
      const values = evalFn([{ id: "", values: x }] as ArtifactBuildData[] & {
        length: 1;
      });
      const f = values.splice(0, nodes.length);
      const df = nonzeroDerivs.map((subs) =>
        Object.fromEntries(subs.map((s) => [s, values.shift()!])),
      ) as DynStat[];
      return [f, df];
    },
  };
}

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

export function expandRollsLevel(
  obj: Objective,
  rolls: RollsLevelNode,
): { p: number; n: ValuesLevelNode }[] {
  // TODO: Given a rolls node, return a list of Values nodes and evaluate them.
  const rollValues = rolls.subs.map(({ key, rolls }) => {
    const rollValue = range(7 * rolls, 10 * rolls + 1);
    return rollValue.map((v) => ({
      p: 4 ** -rolls * quadrinomial(rolls, v - 7 * rolls),
      stat: { [key]: v } as DynStat,
    }));
  });
  return cartesian(...rollValues).map((rvs) => {
    const { p, stat } = rvs.reduce((acc, rv) => ({
      p: acc.p * rv.p,
      stat: { ...acc.stat, ...rv.stat },
    }));

    const stats = { ...rolls.base };
    Object.entries(stat).forEach(([k, v]) => (stats[k] = (stats[k] ?? 0) + v));

    return {
      p,
      n: makeValuesNode(obj, stats),
    };
  });
}

function expandSubstatsLevel(
  obj: Objective,
  substatNode: SubstatLevelNode,
): RollsLevelNode[] {
  // TODO: Given a substat node, create a list of Rolls nodes and evaluate them.
  return [];
}

function makeValuesNode(obj: Objective, base: DynStat): ValuesLevelNode {
  const subDistr = {
    base,
    subs: [],
    mu: [],
    cov: [[]],
  };
  return {
    type: "values",
    subDistr,
    evaluation: evaluateGaussian(obj, subDistr),
  };
}
