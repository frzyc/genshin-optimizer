import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5g400e344x0a-08F0000g5001044F02W03g08Q0g4003132L09s000095808245l03e02i1a-0g5g02441db961a-06Y17000004L70A00000eSacrificialBow3L800101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Diona's Formulas (VoidAssassin#9930)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 7818, characterATK: 671 - 497, characterDEF: 491,
      characterEle: "cryo", characterLevel: 70,
      weaponType: "bow", weaponATK: 497, enerRech_: 27.9,//Sacrificial Bow Lvl. 80 (Refinement 1)
      cryo_dmg_: 18,//specialized
      skill_dmg_: 15,//C2

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 5 - 1, skill: 9 - 1, burst: 9 - 1 }),
      constellation: 6,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { burst_dmg_: 20 }, // 4 piece noblesse
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(55)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(51)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(70)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(66)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(83)

        expect(formula.charged.hit(stats)[0](stats)).toApproximate(67)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(695)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(338)

        expect(formula.burst.regen(stats)[0](stats)).toApproximate(2289)
      })
      test("burst + noblesse", () => {
        setupStats.atk_ += 20
        const stats = computeAllStats(setupStats)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(782)
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(514)
      })
      test('regen <50% HP', () => {
        setupStats.incHeal_ += 30
        const stats = computeAllStats(setupStats)
        expect(formula.burst.regen(stats)[0](stats)).toApproximate(2976)
      })

    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(94)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(87)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(118)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(112)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(140)

        expect(formula.charged.hit(stats)[0](stats)).toApproximate(114)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(1173)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(570)
      })
      test("burst + noblesse", () => {
        setupStats.atk_ += 20
        const stats = computeAllStats(setupStats)

        // expect(formula.burst.dmg(stats)[0](stats)).toApproximate()
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(867)
      })
    })
  })
})
