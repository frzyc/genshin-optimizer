import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=545k01048W0aX23L07j0u5g0314aq31u79a12F095k06244c22n13v096195k0c341h39428x162145809445l07E04R03e0t000003L9000000fWolfsGravestone3L900101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Xinyan's Formulas (Stain#9093)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 11201, characterATK: 857 - 608, characterDEF: 799,
      characterEle: "pyro", characterLevel: 90,
      weaponType: "claymore", weaponATK: 608,
      atk_: 24 + 49.6 + 20,//specialized + Wolf’s Gravestone Lvl. 90 (Refinement 1)

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 9 - 1, skill: 9 - 1, burst: 9 - 1 }),
      constellation: 6,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { physical_dmg_: 25, atk_: 18 }, // 2 blood 2 glad
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(911)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(880)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(1137)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(1379)
        expect(formula.charged.spinningDEF(stats)[0](stats)).toApproximate(959)
        expect(formula.charged.finalDEF(stats)[0](stats)).toApproximate(1734)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(888)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1776)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(2218)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(3059)
        expect(formula.skill.dot(stats)[0](stats)).toApproximate(606)

        // expect(formula.burst.dmg(stats)[0](stats)).toApproximate() C2 cant not crit
        expect(formula.burst.dot(stats)[0](stats)).toApproximate(721)
      })

      test("vaorize", () => {
        setupStats.reactionMode = "pyro_vaporize"
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(5098)
      })
      test("melt", () => {
        setupStats.reactionMode = "pyro_melt"
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(6798)
      })

      test("shielded hit + infusion", () => {
        setupStats.physical_dmg_ += 15
        setupStats.physical_enemyRes_ += -15
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(1479)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(1429)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(1845)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(2239)
        expect(formula.charged.spinningDEF(stats)[0](stats)).toApproximate(1556)
        expect(formula.charged.finalDEF(stats)[0](stats)).toApproximate(2813)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

      })
    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(1735)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(1677)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(2164)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(2627)
        expect(formula.charged.spinningDEF(stats)[0](stats)).toApproximate(1826)
        expect(formula.charged.finalDEF(stats)[0](stats)).toApproximate(3301)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(1691)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(3382)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(4224)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(5825)
        expect(formula.skill.dot(stats)[0](stats)).toApproximate(1154)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(7151)
        expect(formula.burst.dot(stats)[0](stats)).toApproximate(1373)
      })

      test("shielded hit + infusion", () => {
        setupStats.physical_dmg_ += 15
        setupStats.physical_enemyRes_ += -15
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(2816)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(2721)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(3513)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(4263)
        expect(formula.charged.spinningDEF(stats)[0](stats)).toApproximate(2963)
        expect(formula.charged.finalDEF(stats)[0](stats)).toApproximate(5358)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(11605)
      })
    })
  })
})
