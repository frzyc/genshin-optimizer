import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"
import weaponFormula from '../../Weapons/Claymore/SkywardPride/data'

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=595k0104aS09B13e08l2g5k03149215W04i2ae195k08247I03x0921aq3p5k0d34aa38W01db9a1g5k0944882aS04o26W0A106003L8005670cSkywardPride3L9001010151c1A5sheet6talent1e2114pyro0";
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
      { burst_dmg_: 20, atk_: 18 }, // NO2 glad2
    ]));

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(738)
        expect(formula.skill.kick_press(stats)[0](stats)).toApproximate(3316)
        expect(formula.skill.kick_hold(stats)[0](stats)).toApproximate(6365)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(2854)
        expect(formula.burst.muji_dmg(stats)[0](stats)).toApproximate(1570)
      });
    });

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit");
      test("crit hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(977);
        expect(formula.skill.kick_hold(stats)[0](stats)).toApproximate(13406)

        expect(formula.burst.muji_dmg(stats)[0](stats)).toApproximate(3306)
        expect(weaponFormula.dmg(stats)[0](stats)).toApproximate(744)
      });

    });
  });
});
