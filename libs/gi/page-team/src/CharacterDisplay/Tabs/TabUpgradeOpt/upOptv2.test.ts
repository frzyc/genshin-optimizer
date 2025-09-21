import { evaluateGaussian, makeObjective } from "./upOptv2";

import { dynRead, sum, prod } from "@genshin-optimizer/gi/wr";
import type { GaussianNode } from "./upOptv2.types";

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
});
