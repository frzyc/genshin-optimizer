import { evaluateGaussian, expandRollsLevel, makeObjective } from "./upOptv2";

import { dynRead, sum, prod } from "@genshin-optimizer/gi/wr";
import type { GaussianNode, RollsLevelNode } from "./upOptv2.types";

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

    // Jf = [[1, 1500, 0], [critRate_, 1500 * critRate_, atk + 1500 * atk_]]
    const Jf = [
      [1, 1500, 0],
      [1.1, 1500 * 1.1, 110 + 1500 * 2.0],
    ];
    // f_cov = Jf * cov * Jf^T
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

  test("expandrolls", () => {
    const rollsNode = {
      type: "rolls" as const,
      base: { atk: 100, atk_: 0, critRate_: 0.0 },
      subs: [
        { key: "atk" as const, rolls: 2 },
        { key: "atk_" as const, rolls: 1 },
        { key: "critRate_" as const, rolls: 1 },
      ],
      subDistr: {
        base: { atk: 100, atk_: 0, critRate_: 0.0 },
        subs: ["atk", "atk_", "critRate_"],
        mu: [33.065, 0.049555, 0.033065],
        cov: [
          [9.4575625, 0, 0],
          [0, 0.0000424861, 0],
          [0, 0, 0.0000189151],
        ],
      } as GaussianNode,
    } as RollsLevelNode;

    const obj1 = makeObjective([nodeLinear], [4000]);
    const values1 = expandRollsLevel(obj1, rollsNode);

    // Check probabilities sum to 1
    expect(values1.reduce((a, { p }) => a + p, 0)).toBeCloseTo(1);
    const mus1 = values1.map(({ p, n }) => ({ p, v: n.evaluation!.f_mu[0] }));

    const eval1 = evaluateGaussian(obj1, rollsNode.subDistr); // Linear f_mu and f_cov should match
    const mean = mus1.reduce((a, { p, v }) => a + p * v, 0);
    const variance = mus1.reduce((a, { p, v }) => a + p * (v - mean) ** 2, 0);
    expect(mean).toBeCloseTo(eval1.f_mu[0]);
    expect(variance).toBeCloseTo(eval1.f_cov[0][0]);

    const obj2 = makeObjective([nodeNonlinear], [4000]);
    const values2 = expandRollsLevel(obj2, rollsNode);
    expect(values2.reduce((a, { p }) => a + p, 0)).toBeCloseTo(1);
    const mus2 = values2.map(({ p, n }) => ({ p, v: n.evaluation!.f_mu[0] }));

    // Nonlinear f_mu need not match, but should still be close enough.
    const eval2 = evaluateGaussian(obj2, rollsNode.subDistr);
    const mean2 = mus2.reduce((a, { p, v }) => a + p * v, 0);
    const variance2 = mus2.reduce((a, { p, v }) => a + p * (v - mean2) ** 2, 0);
    expect(mean2).toBeCloseTo(eval2.f_mu[0]);
    expect(variance2).toBeCloseTo(eval2.f_cov[0][0]);
  });
});
