import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5u5k03144L11Y79x1ak2u5k0a449W07E03t01u7c5k0j348R29t1a427l0u5k01049217B08W04z2u5g04245n08E29a17I0w132004L70A055509MappaMare3L8011010731c1w1q11131c1w2p111331c1w2c211131a1c4set411131a164set411231a1g4set411131w9MappaMare2is1110";
const { artifacts } = parseTestFlexObject(url);

let setupStats;
describe("Testing Yanfei's Formulas (Stain#9093)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 7641, characterATK: 693 - 497, characterDEF: 480,
      characterEle: "pyro", characterLevel: 70,
      weaponType: "catalyst", weaponATK: 497,
      eleMas: 101,//Mappa Mare Lvl. 80 (Refinement 2)
      pyro_dmg_: 18, //pyro dmg bonus from specialization

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 6 - 1, skill: 6 - 1, burst: 6 - 1 }),
      constellation: 2,
    });
  });

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { eleMas: 80, charged_dmg_: 35 }, // 4pc wanderers
    ]));

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(863);
        expect(formula.normal[1](stats)[0](stats)).toApproximate(771);
        expect(formula.normal[2](stats)[0](stats)).toApproximate(1125);
        expect(formula.charged[0](stats)[0](stats)).toApproximate(1659);
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(873);
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1746);
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(2182);

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2511);
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(2700);

        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(1026);
      });
      test('vaporize', () => {
        setupStats.reactionMode = "pyro_vaporize"
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(5729);
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(6161);
      })
      test('melt', () => {
        setupStats.reactionMode = "pyro_melt"
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(7639);
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(8215);
      })

      test("1 Proviso", () => {
        setupStats.pyro_dmg_ += 5
        const stats = computeAllStats(setupStats)
        expect(formula.charged[1](stats)[0](stats)).toApproximate(2001);
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(1051);

      });
      test("2 Proviso", () => {
        setupStats.pyro_dmg_ += 10
        const stats = computeAllStats(setupStats)
        expect(formula.charged[2](stats)[0](stats)).toApproximate(2358);
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(1077);

      });
      test("3 Proviso", () => {
        setupStats.pyro_dmg_ += 15
        const stats = computeAllStats(setupStats)
        expect(formula.charged[3](stats)[0](stats)).toApproximate(2729);
        expect(formula.normal[0](stats)[0](stats)).toApproximate(942);
        expect(formula.normal[1](stats)[0](stats)).toApproximate(842);
        expect(formula.normal[2](stats)[0](stats)).toApproximate(1228);
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(1103);

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2740);
      });
      test('3 Proviso with Brilliance ', () => {
        setupStats.pyro_dmg_ += 15
        setupStats.charged_dmg_ += 44
        const stats = computeAllStats(setupStats)
        expect(formula.charged[3](stats)[0](stats)).toApproximate(3288);
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(1329);
      })

    });

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit");
      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(2074);
        expect(formula.normal[1](stats)[0](stats)).toApproximate(1853);
        expect(formula.normal[2](stats)[0](stats)).toApproximate(2703);
        expect(formula.charged[0](stats)[0](stats)).toApproximate(3986);
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(2098);
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(4195);
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(5240);

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(6031);
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(6486);

        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(2464);
      });
      test('vaporize', () => {
        setupStats.reactionMode = "pyro_vaporize"
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(13759);
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(14798);
      })
      test('melt', () => {
        setupStats.reactionMode = "pyro_melt"
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(18346);
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(19731);
      })

      test("1 Proviso", () => {
        setupStats.pyro_dmg_ += 5
        const stats = computeAllStats(setupStats)
        expect(formula.charged[1](stats)[0](stats)).toApproximate(4807);
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(2526);

      });
      test("2 Proviso", () => {
        setupStats.pyro_dmg_ += 10
        const stats = computeAllStats(setupStats)
        expect(formula.charged[2](stats)[0](stats)).toApproximate(5663);
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(2587);

      });
      test("3 Proviso", () => {
        setupStats.pyro_dmg_ += 15
        const stats = computeAllStats(setupStats)
        expect(formula.charged[3](stats)[0](stats)).toApproximate(6554);
        expect(formula.normal[0](stats)[0](stats)).toApproximate(2263);
        expect(formula.normal[1](stats)[0](stats)).toApproximate(2022);
        expect(formula.normal[2](stats)[0](stats)).toApproximate(2949);
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(2649);

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(6581);
      });
      test('3 Proviso with Brilliance ', () => {
        setupStats.pyro_dmg_ += 15
        setupStats.charged_dmg_ += 44
        const stats = computeAllStats(setupStats)
        expect(formula.charged[3](stats)[0](stats)).toApproximate(7898);
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(3192);
      })

    });
  });
});
