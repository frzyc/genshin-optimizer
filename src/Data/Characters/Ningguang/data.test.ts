import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=515k03145l04o2aY19S095k04249r0aF32W08x195k09444L110ea613g0e5k0h34aY19D03v08E215k01047g0ai39r03N0h203003L9007650bFrostbearer3L901101000";
const { artifacts } = parseTestFlexObject(url);

let setupStats;
describe("Testing Ningguang's Formulas (Geeker106#9626)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 9787, characterATK: 212, characterDEF: 573,
      characterEle: "geo", characterLevel: 90,
      weaponType: "catalyst", weaponATK: 510,
      atk_: 41.3,//Frostbearer Catalyst R2
      geo_dmg_: 24, // geodmg bonus from specialization

      enemyLevel: 90, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 8 - 1, skill: 7 - 1, burst: 9 - 1 }),
      constellation: 6,
    });
  });

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { atk_: 18, geo_dmg_: 15 }, // 2pc Gladiator's Finale, 2pc Archaic Petra
    ]));

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal.hit(stats)[0](stats)).toApproximate(779);
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(4844);
        expect(formula.charged.jade(stats)[0](stats)).toApproximate(1380);
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(4220);

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(6011);
        expect(formula.burst.dmg_per_gem(stats)[0](stats)).toApproximate(2571);
      });
    });

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit");

      test("hit", () => {
        const stats = computeAllStats(setupStats);
        expect(formula.normal.hit(stats)[0](stats)).toApproximate(1762);
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(10957);
        expect(formula.charged.jade(stats)[0](stats)).toApproximate(3122);
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(9544);

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(13595);

        expect(formula.burst.dmg_per_gem(stats)[0](stats)).toApproximate(5815);
      });
    });
  });
});
