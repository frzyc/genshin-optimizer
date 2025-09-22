import {
  ddx,
  optimize,
  precompute,
  zero_deriv,
  type OptNode,
} from "@genshin-optimizer/gi/wr";
import type { ArtifactRarity, SubstatKey } from "@genshin-optimizer/gi/consts";
import { allSubstatKeys } from "@genshin-optimizer/gi/consts";
import type { ArtifactBuildData, DynStat } from "@genshin-optimizer/gi/solver";
import { allStats } from "@genshin-optimizer/gi/stats";

import type {
  Objective,
  RollsLevelNode,
  SubstatLevelNode,
  ValuesLevelNode,
} from "./upOptv2.types";

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

// Memoized substat value variance lookup
const substatValueVarCache: Record<
  string,
  { mean: number; variance: number; values: number[] }
> = {};
function getSubstatValueVariance(key: SubstatKey, rarity: ArtifactRarity) {
  const cacheKey = JSON.stringify({ key, rarity });
  if (substatValueVarCache[cacheKey]) return substatValueVarCache[cacheKey];

  const values = allStats.art.sub[rarity][key];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  substatValueVarCache[cacheKey] = { mean, variance, values };
  return { mean, variance, values };
}

export function makeRollsNode(
  { base }: SubstatLevelNode,
  rolls: { key: SubstatKey; rolls: number }[],
): RollsLevelNode {
  const subDistr = {
    base,
    subs: rolls.map(({ key }) => key),
    mu: rolls.map(
      ({ key, rolls }) => rolls * getSubstatValueVariance(key, 5).mean,
    ),
    cov: rolls.map(({ key, rolls: r }, i) =>
      rolls.map((_, j) =>
        i === j ? r * getSubstatValueVariance(key, 5).variance : 0,
      ),
    ),
  };

  return {
    type: "rolls",
    base,
    subs: rolls,
    subDistr,
  };
}

export function makeValuesNode(base: DynStat): ValuesLevelNode {
  const subDistr = {
    base,
    subs: [],
    mu: [],
    cov: [[]],
  };
  return {
    type: "values",
    subDistr,
  };
}
