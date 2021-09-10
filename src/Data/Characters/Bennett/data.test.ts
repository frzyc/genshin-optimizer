import { KeyPath } from "../../../Util/KeyPathUtil"
import { FormulaPathBase } from "../../formula"
import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula, { data } from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=565k01049Y1aY18W063265k03148W0ae19D07t1e5k04249D05f18W0a4264g0j348A03g06R01m965k04449J12F1ae13x04001003L60033394atk_225iphysical_enemyRes_250aenemyLevel275fanemo_enemyRes_3-10dgeo_enemyRes_3-10helectro_enemyRes_3-10fhydro_enemyRes_3-10epyro_enemyRes_3-10ecryo_enemyRes_3-10cSkywardBlade3L700101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Bennett's Formulas (Mabmab#6492)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 8168, characterATK: 583 - 457, characterDEF: 508,
      characterEle: "pyro", characterLevel: 60,
      weaponType: "sword", weaponATK: 457,
      enerRech_: 45.4 + 13.3, critRate_: 4 + 5,//Skyward Blade

      atk_: 25,//pyro reso
      enemyLevel: 75, physical_enemyRes_: 70 - 20, // Ruin Guard with Zhongli shield
      pyro_enemyRes_: 10 - 20,
      tlvl: Object.freeze({ auto: 4 - 1, skill: 4 - 1, burst: 4 - 1 }),
      constellation: 1,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { pyro_dmg_: 15 + 22.5, vaporize_dmg_: 15, overloaded_dmg_: 40, }, // 4 piece crimson witch + 3 stacks
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(222)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(213)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(272)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(297)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(358)
        expect(formula.charged[0](stats)[0](stats)).toApproximate(278)
        expect(formula.charged[1](stats)[0](stats)).toApproximate(302)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(318)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(637)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(795)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(2424)
        expect(formula.skill.lvl1hit1(stats)[0](stats)).toApproximate(1480)
        expect(formula.skill.lvl1hit2(stats)[0](stats)).toApproximate(1621)
        expect(formula.skill.lvl2hit1(stats)[0](stats)).toApproximate(1550)
        expect(formula.skill.lvl2hit2(stats)[0](stats)).toApproximate(1691)
        expect(formula.skill.explosion(stats)[0](stats)).toApproximate(2326)
      })

    })
    describe("no crit burst hit", () => {
      beforeEach(() => {
        setupStats.hitMode = "hit"
        setupStats.modifiers = { atk: [KeyPath<FormulaPathBase, any>().character.Bennett.burst.atkBonus()] }
      })
      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(5421)
      })
    })
    describe("no crit, vaporize", () => {
      beforeEach(() => {
        setupStats.hitMode = "hit"
        setupStats.reactionMode = "pyro_vaporize"
      })

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.press(stats)[0](stats)).toApproximate(4814)
      })

    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(424)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(407)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(520)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(568)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(685)
        expect(formula.charged[0](stats)[0](stats)).toApproximate(532)
        expect(formula.charged[1](stats)[0](stats)).toApproximate(578)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(609)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1217)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1521)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(4635)
        expect(formula.skill.lvl1hit1(stats)[0](stats)).toApproximate(2830)
        expect(formula.skill.lvl1hit2(stats)[0](stats)).toApproximate(3099)
        expect(formula.skill.lvl2hit1(stats)[0](stats)).toApproximate(2964)
        expect(formula.skill.lvl2hit2(stats)[0](stats)).toApproximate(3234)
        expect(formula.skill.explosion(stats)[0](stats)).toApproximate(4447)
      })

    })
    describe("crit burst hit", () => {
      beforeEach(() => {
        setupStats.hitMode = "critHit"
        setupStats.modifiers = { atk: [KeyPath<FormulaPathBase, any>().character.Bennett.burst.atkBonus()] }
      })
      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(10365)
      })
    })
    describe("no crit, vaporize", () => {
      beforeEach(() => {
        setupStats.hitMode = "critHit"
        setupStats.reactionMode = "pyro_vaporize"
      })

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.press(stats)[0](stats)).toApproximate(9203)
      })
    })
  })
})
