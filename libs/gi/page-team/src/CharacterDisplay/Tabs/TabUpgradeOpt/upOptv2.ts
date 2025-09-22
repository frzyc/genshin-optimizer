import { cartesian, range } from "@genshin-optimizer/common/util";

import type {
  Objective,
  RollsLevelNode,
  SubstatLevelNode,
  ValuesLevelNode,
} from "./upOptv2.types";
import { quadrinomial } from "./mathUtil";

import { getSubstatValue } from "@genshin-optimizer/gi/util";
import { makeValuesNode } from "./upOptMakeNode";

export function expandRollsLevel(
  obj: Objective,
  rolls: RollsLevelNode,
): { p: number; n: ValuesLevelNode }[] {
  // TODO: Given a rolls node, return a list of Values nodes and evaluate them.
  const rollValues = rolls.subs.map(({ key, rolls }) => {
    const rollValue = range(7 * rolls, 10 * rolls + 1);
    return rollValue.map((v) => ({
      p: 4 ** -rolls * quadrinomial(rolls, v - 7 * rolls),
      stat: {
        [key]: (v * getSubstatValue(key, 5, "max", false)) / 10,
      },
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
      n: makeValuesNode(stats),
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
