import { dynRead, sum, prod } from "@genshin-optimizer/gi/wr";

import { expandRollsLevel } from "./expandRolls";
import { evalMarkovNode, evaluateGaussian } from "./evaluation";
import { makeObjective } from "./makeObjective";
import {
  expandSubstatLevel,
  makeRollsNode,
  makeSubstatNode,
} from "./expandSubstat";
import type {
  GaussianNode,
  MarkovNode,
  Objective,
  SubstatLevelNode,
} from "./upOpt.types";

describe("upOptv2", () => {
  const nodeLinear = sum(dynRead("atk"), prod(1500, dynRead("atk_")));
  const nodeNonlinear = prod(nodeLinear, dynRead("critRate_"));
  const obj = makeObjective([nodeLinear, nodeNonlinear], [4000, 100]);

  // TEST makeObjective:
  // Checks whether the objective function and its derivatives are computed correctly.
  test("makeObjective", () => {
    expect(obj.threshold).toEqual([4000, 100]);

    const [f, df] = obj.computeWithDerivs({
      atk: 100,
      atk_: 0.5,
      critRate_: 0.7,
    });
    // f0 = atk + 1500 * atk_ = 100 + 1500 * 0.5
    // f1 = (atk + 1500 * atk_) * critRate_ = (100 + 1500 * 0.5) * 0.7
    expect(f[0]).toBeCloseTo(100 + 1500 * 0.5);
    expect(f[1]).toBeCloseTo((100 + 1500 * 0.5) * 0.7);

    // Jf0 = [1, 1500, 0]
    // Jf1 = [critRate_, 1500 * critRate_, atk + 1500 * atk_]
    expect(df[0]["atk"]).toBeCloseTo(1);
    expect(df[0]["atk_"]).toBeCloseTo(1500);
    expect(df[1]["atk"]).toBeCloseTo(0.7);
    expect(df[1]["atk_"]).toBeCloseTo(1500 * 0.7);
    expect(df[1]["critRate_"]).toBeCloseTo(100 + 1500 * 0.5);
  });

  test("evaluateGaussianDegen", () => {
    const gnode: GaussianNode = {
      base: { atk: 100, atk_: 1.5, critRate_: 1.0 },
      subs: [],
      mu: [],
      cov: [[]],
    };
    const { f_mu, f_cov, prob, constr_prob, upAvg } = evaluateGaussian(
      obj,
      gnode,
    );
    expect(f_mu[0]).toBeCloseTo(100 + 1500 * 1.5);
    expect(f_mu[1]).toBeCloseTo((100 + 1500 * 1.5) * 1.0);
    expect(f_cov).toStrictEqual([
      [0, 0],
      [0, 0],
    ]);
    expect(prob).toBeCloseTo(0);
    expect(constr_prob).toBeCloseTo(1);
    expect(upAvg).toBeCloseTo(0);
  });

  test("evaluateGaussianDegen2", () => {
    const obj2 = makeObjective([nodeLinear, nodeNonlinear], [2000, 100]);
    const gnode: GaussianNode = {
      base: { atk: 100, atk_: 1.5, critRate_: 1.0 },
      subs: [],
      mu: [],
      cov: [[]],
    };
    const { f_mu, f_cov, prob, constr_prob, upAvg } = evaluateGaussian(
      obj2,
      gnode,
    );
    expect(f_mu[0]).toBeCloseTo(100 + 1500 * 1.5);
    expect(f_mu[1]).toBeCloseTo((100 + 1500 * 1.5) * 1.0);
    expect(f_cov).toStrictEqual([
      [0, 0],
      [0, 0],
    ]);
    expect(prob).toBeCloseTo(1);
    expect(constr_prob).toBeCloseTo(1);
    expect(upAvg).toBeCloseTo(100 + 1500 * 1.5 - 2000);
  });

  // TEST evaluateGaussian:
  // Checks whether the Gaussian evaluation (propagation through nonlinear functions)
  // and probability calculations are correct.
  // The expected values are precomputed using Mathematica for accuracy.
  test("evaluateGaussian", () => {
    const gnode: GaussianNode = {
      base: { atk: 100, atk_: 1.5, critRate_: 1.0 },
      subs: ["atk", "atk_", "critRate_"],
      mu: [10, 0.5, 0.1],
      cov: [
        [4, 0, 0],
        [0, 0.25, 0],
        [0, 0, 0.01],
      ],
    };
    const { f_mu, f_cov, prob, constr_prob, upAvg } = evaluateGaussian(
      obj,
      gnode,
    );
    // f_mu = [atk + 1500 * atk_, (atk + 1500 * atk_) * critRate_]
    expect(f_mu[0]).toBeCloseTo(110 + 1500 * 2.0);
    expect(f_mu[1]).toBeCloseTo((110 + 1500 * 2.0) * 1.1);

    const Jf = [
      [1, 1500, 0],
      [1.1, 1500 * 1.1, 110 + 1500 * 2.0],
    ];
    // f_cov = Jf @ cov @ Jf^T
    expect(f_cov[0][0]).toBeCloseTo(
      4 * Jf[0][0] ** 2 + 0.25 * Jf[0][1] ** 2 + 0.01 * Jf[0][2] ** 2,
    );
    expect(f_cov[1][1]).toBeCloseTo(
      4 * Jf[1][0] ** 2 + 0.25 * Jf[1][1] ** 2 + 0.01 * Jf[1][2] ** 2,
    );
    expect(f_cov[0][1]).toBeCloseTo(
      4 * Jf[0][0] * Jf[1][0] +
        0.25 * Jf[0][1] * Jf[1][1] +
        0.01 * Jf[0][2] * Jf[1][2],
    );
    expect(f_cov[1][0]).toBeCloseTo(f_cov[0][1]);

    // Thresholds are [4000, 100], so constr_prob = P[X1 > 100] ~ 1
    // prob ~ P[X0 > 4000], where X0 ~ N(3110, 562504) (numbers from Mathematica)
    expect(prob).toBeCloseTo(0.11768039653389202);
    expect(constr_prob).toBeCloseTo(0.9999172882229448);

    // upAvg = E[X0 - 4000 | X0 > 4000] ~ 367.45 (number from Mathematica)
    expect(upAvg).toBeCloseTo(367.4450206921483);
  });

  test("expandSubstatReshape", () => {
    const subNode: SubstatLevelNode = {
      type: "substat",
      base: { atk: 100, atk_: 0, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: "atk", baseRolls: 0 },
        { key: "atk_", baseRolls: 0 },
        { key: "critRate_", baseRolls: 0 },
        { key: "def", baseRolls: 0 },
      ],
      rollsLeft: 4,
      reshape: { affixes: ["atk_", "critRate_"], mintotal: 2 },
    } as any as SubstatLevelNode;

    const expanded = expandSubstatLevel(subNode);
    const precomputed = [
      { p: 0.00390625, subs: [0, 4, 0, 0] },
      { p: 0.00390625, subs: [0, 0, 4, 0] },
      { p: 0.015625, subs: [0, 1, 3, 0] },
      { p: 0.0234375, subs: [0, 2, 2, 0] },
      { p: 0.015625, subs: [0, 0, 3, 1] },
      { p: 0.046875, subs: [1, 2, 1, 0] },
      { p: 0.0859375, subs: [1, 2, 0, 1] },
      { p: 0.04296875, subs: [0, 0, 2, 2] },
      { p: 0.171875, subs: [1, 1, 1, 1] },
      { p: 0.0859375, subs: [0, 1, 1, 2] },
    ];

    expect(expanded.reduce((a, { p }) => a + p, 0)).toBeCloseTo(1);
    precomputed.forEach(({ p, subs }) => {
      expect(
        expanded.filter(({ n }) =>
          subs.every((v, i) => n.subs[i].rolls === v),
        )[0]!.p,
      ).toBeCloseTo(p);
    });
  });

  /**
   * Checks whether the expanded nodes' evaluations match the base Gaussian node's evaluation.
   * Should only work for linear objectives.
   *
   * This function essentially checks that the Gaussian Mixture Model (GMM) formed by the expanded nodes
   * has the same mean and variance as the original Gaussian node.
   *
   * @param obj Linear(!) objective function
   * @param expanded Weighted list of expanded nodes (GMM distribution)
   * @param g Base Gaussian node
   */
  function checkExpandedEvalCorrectness(
    obj: Objective,
    expanded: { p: number; n: MarkovNode }[],
    g: GaussianNode,
  ) {
    // Check probabilities sum to 1
    expect(expanded.reduce((_, { p }) => _ + p, 0)).toBeCloseTo(1);
    const expanded2 = expanded.map(({ p, n }) => {
      const emn = evalMarkovNode(obj, n);
      return {
        p,
        mu: emn.evaluation.f_mu[0],
        sig2: emn.evaluation.f_cov[0][0],
      };
    });
    const mean = expanded2.reduce((a, { p, mu }) => a + p * mu, 0);
    const sig2 = expanded2.reduce(
      (a, { p, mu, sig2 }) => a + p * (sig2 + mu ** 2),
      -(mean ** 2),
    );

    // Check means and variances match
    const baseEval = evaluateGaussian(obj, g);
    expect(mean).toBeCloseTo(baseEval.f_mu[0]);
    expect(sig2).toBeCloseTo(baseEval.f_cov[0][0]);
  }
  test("expandrolls", () => {
    const rollsNode = makeRollsNode(
      {
        base: { atk: 100, atk_: 0, critRate_: 0 },
        rarity: 5,
      } as any as SubstatLevelNode,
      [
        { key: "atk" as const, rolls: 2 },
        { key: "atk_" as const, rolls: 1 },
        { key: "critRate_" as const, rolls: 1 },
      ],
    );
    const expanded = expandRollsLevel(rollsNode);

    const obj1 = makeObjective([nodeLinear], [4000]);
    checkExpandedEvalCorrectness(obj1, expanded, rollsNode.subDistr);

    const obj2 = makeObjective([dynRead("atk")], [0]);
    checkExpandedEvalCorrectness(obj2, expanded, rollsNode.subDistr);

    const obj3 = makeObjective([dynRead("atk_")], [0.1]);
    checkExpandedEvalCorrectness(obj3, expanded, rollsNode.subDistr);

    const obj4 = makeObjective([dynRead("critRate_")], [0.1]);
    checkExpandedEvalCorrectness(obj4, expanded, rollsNode.subDistr);
  });

  test("expandSubstat", () => {
    const n = makeSubstatNode({
      base: { atk: 100, atk_: 0.5, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: "atk", baseRolls: 0 },
        { key: "atk_", baseRolls: 0 },
        { key: "critRate_", baseRolls: 0 },
        { key: "def", baseRolls: 0 },
      ],
      rollsLeft: 5,
    });
    const expanded = expandSubstatLevel(n);

    const obj = makeObjective([nodeLinear], [4000]);
    checkExpandedEvalCorrectness(obj, expanded, n.subDistr);
  });

    test("expandSubstatFancy", () => {
    const n = makeSubstatNode({
      base: { atk: 100, atk_: .5, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: "atk", baseRolls: 0 },
        { key: "atk_", baseRolls: 2 },
        { key: "critRate_", baseRolls: 3 },
        { key: "def", baseRolls: 0 },
      ],
      rollsLeft: 5,
      reshape: { affixes: ["atk", "critRate_"], mintotal: 2 },
    });
    const expanded = expandSubstatLevel(n);

    const obj = makeObjective([nodeLinear], [4000]);
    checkExpandedEvalCorrectness(obj, expanded, n.subDistr);
  });

  // test("debug", () => {
  //   const n = makeSubstatNode({
  //     base: { atk: 0, atk_: 0, critRate_: 0 },
  //     rarity: 5,
  //     subkeys: [
  //       { key: "atk", baseRolls: 0 },
  //       { key: "atk_", baseRolls: 0 },
  //       // { key: "critRate_", baseRolls: 0 },
  //       // { key: "def", baseRolls: 0 },
  //     ],
  //     rollsLeft: 5,
  //     reshape: { affixes: ["def", "critRate_"], mintotal: 3 },
  //   })
  //   // console.log('DEBUG', n);
  //   // console.log('DEBUG', n.subDistr.cov);
  // });
});
