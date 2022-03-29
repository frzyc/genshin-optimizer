import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5e5c01043j08K12F0ac2e5903142R11d45j06Y1e5a08245n07l0aS03B0e4c02343g07u05j01D2e4c04442L01m68Q03g07000004L80A00000eFavoniusWarbow3L850101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Diona's Formulas (⛧ Sin ⛧#0663)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 8907, characterATK: 638 - 440, characterDEF: 559,
      characterEle: "cryo", characterLevel: 80,
      weaponType: "bow", weaponATK: 440, enerRech_: 58.6,//Favonius Warbow Lvl. 85 (Refinement 1)
      cryo_dmg_: 24,//specialized
      skill_dmg_: 15,//C2

      enemyLevel: 82, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 6 - 1, skill: 10 - 1, burst: 11 - 1 }),
      constellation: 6,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { heal_: 15 }, // 4 piece maiden
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(83)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(77)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(105)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(99)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(124)

        expect(formula.charged.hit(stats)[0](stats)).toApproximate(101)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(1029)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(328)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(501)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(901)
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(593)
      })
      test('4p Maiden', () => {
        setupStats.incHeal_ += 20
        const stats = computeAllStats(setupStats)
        expect(formula.burst.regen(stats)[0](stats)).toApproximate(3998)//3407.2124601399996
      })
      test('4p Maiden + C6', () => {
        setupStats.incHeal_ += 50
        const stats = computeAllStats(setupStats)
        expect(formula.burst.regen(stats)[0](stats)).toApproximate(4886)
      })
      test('melt', () => {
        setupStats.reactionMode = "cryo_melt"
        const stats = computeAllStats(setupStats)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(1694)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(825)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1483)
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(976)
      })
    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(141)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(131)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(178)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(168)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(210)

        expect(formula.charged.hit(stats)[0](stats)).toApproximate(172)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(1743)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(849)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1526)
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(1004)
      })
    })
  })
})
