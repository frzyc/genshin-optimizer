import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5b4501046W02G05h08F0b4603141L35d07d0000u4406247h0aU09s04L0b4506344B02B07f0000b4606443g04B01n3000t000003L8000000lSacrificialGreatsword4L80A1101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Xinyan's Formulas (⛧ Sin ⛧#0663)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 9927, characterATK: 220, characterDEF: 708,
      characterEle: "pyro", characterLevel: 80,
      weaponType: "claymore", weaponATK: 523,
      enerRech_: 27.9,//Sacrificial greatsword R2
      atk_: 18,//specialized

      enemyLevel: 82, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 6 - 1, skill: 10 - 1, burst: 9 - 1 }),
      constellation: 6,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { eleMas: 80 }, // 4 piece Instructor
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(181)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(175)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(226)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(275)
        expect(formula.charged.spinningDEF(stats)[0](stats)).toApproximate(228)
        expect(formula.charged.finalDEF(stats)[0](stats)).toApproximate(413)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(442)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1496)

        expect(formula.burst.dot(stats)[0](stats)).toApproximate(333)
      })

    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(282)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(273)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(352)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(428)
        expect(formula.charged.spinningDEF(stats)[0](stats)).toApproximate(355)
        expect(formula.charged.finalDEF(stats)[0](stats)).toApproximate(643)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(688)
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate(688)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(688)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2328)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1472)
        expect(formula.burst.dot(stats)[0](stats)).toApproximate(518)
      })
    })
  })
})
