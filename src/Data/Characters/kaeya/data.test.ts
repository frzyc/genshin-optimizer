import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5o4803147f0a-08L05h0o4g07241D22k19s06z164g0e34aS19p03g08o13580a441Y78W05n03v035g01046P0a618F37l0c000004L60A00000jBlackcliffLongsword3L500101000"
const { artifacts } = parseTestFlexObject(url)


let setupStats;
describe("Testing Kaeya's Formulas (Derpy#2132)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 8184, characterATK: 450 - 293, characterDEF: 557,
      characterEle: "cryo", characterLevel: 60,
      weaponType: "sword", weaponATK: 293, critDMG_: 50 + 23.8,//Blackcliff Longsword Lvl. 50 (Refinement 1)
      enerRech_: 13.3, // specialization

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 3 - 1, skill: 3 - 1, burst: 3 - 1 }),
      constellation: 1,
    });
    //has shattering ice, should have no effect.
  });

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { enerRech_: 20, cryo_dmg_: 15 }, // 2pc exiled 2pc blizzard strayer
    ]));

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(55)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(53)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(66)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(72)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(90)
        expect(formula.charged[0](stats)[0](stats)).toApproximate(56)
        expect(formula.charged[1](stats)[0](stats)).toApproximate(74)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(65)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(131)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(163)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(871)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(353)

        expect(formula.passive1.dmg(stats)[0](stats)).toApproximate(95)
      });
      test('melt', () => {
        setupStats.reactionMode = "cryo_melt"
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1711)
      })
    });

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(126)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(121)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(153)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(166)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(207)
        expect(formula.charged[0](stats)[0](stats)).toApproximate(129)
        expect(formula.charged[1](stats)[0](stats)).toApproximate(171)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(150)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(300)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(375)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1998)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(811)

        expect(formula.passive1.dmg(stats)[0](stats)).toApproximate(95)

      });
      test('melt', () => {
        setupStats.reactionMode = "cryo_melt"
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(3925)
      })
    });
  });
});
