import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5v5k01047Z09v0aV33e065k03149a12W08R17W065k07245Y0ac22F19e165k07349B16P08J03L0t5k074419ca428J0511A106003L8005670cSkywardPride3L9001010151c1A5sheet6talent1e2114pyro0";
const { artifacts } = parseTestFlexObject(url);

let setupStats;
describe("Testing Sayu's Formulas (Ahri#1337)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10505, characterATK: 891 - 674, characterDEF: 660,
      characterEle: "anemo", characterLevel: 80,
      weaponType: "claymore", weaponATK: 674,
      enerRech_: 36.8,//Skyward Pride Lv. 90/90
      dmg_: 8,
      weapon: { key: "SkywardPride", refineIndex: 0 },
      eleMas: 72,//specialized

      enemyLevel: 88, physical_enemyRes_: 50, //Stonehide Lawachurl
      tlvl: Object.freeze({ auto: 6 - 1, skill: 10 - 1, burst: 11 - 1 }),
      constellation: 6,
      conditionalValues: { character: { Sayu: { c2: [20] } } }
    });
  });

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { pyro_dmg_: 15 }, // witch2
    ]));
    describe("no crit + 40% atk", () => {
      beforeEach(() => {
        setupStats.hitMode = "hit"
        setupStats.atk_ += 40
      })

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.burst.heal(stats)[0](stats)).toApproximate(4205)
        expect(formula.burst.muji_heal(stats)[0](stats)).toApproximate(5895)
      });
    });
    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(388)
        expect(formula.skill.cryo(stats)[0](stats)).toApproximate(181)
        expect(formula.skill.kick_hold(stats)[0](stats)).toApproximate(3786)
        expect(formula.skill.cryo_kick(stats)[0](stats)).toApproximate(1325)

        expect(formula.skill.kick_press(stats)[0](stats)).toApproximate(1763)

        expect(formula.passive1.heal(stats)[0](stats)).toApproximate(1200)

        expect(stats.cryo_swirl_hit).toApproximate(3121)
      });
    });

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit");
      test("crit hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(785)
        expect(formula.skill.cryo(stats)[0](stats)).toApproximate(366)
      });

    });
  });
});
