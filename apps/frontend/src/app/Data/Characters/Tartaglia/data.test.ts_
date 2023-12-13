import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5u5k09448x1a231q84R145k0i349-0ak28y24L0a5k0104aq35j08R14z1a5k0314a-04i28K12t1g5k04241d4961aY13N0m210003L90068717stamina3240iTheViridescentHunt3L900101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Tartaglia's Formulas (Blakeblaze#2916)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 13103, characterATK: 811 - 510, characterDEF: 815,
      characterEle: "hydro", characterLevel: 90,
      weaponType: "bow", weaponATK: 510, critRate_: 5 + 27.6,//The Viridescent Hunt Lvl. 90 (Refinement 1)
      hydro_dmg_: 28.8,//specialized

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard 
      tlvl: Object.freeze({ auto: 7 - 1, skill: 9 - 1, burst: 8 - 1 }),
      constellation: 1,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { hydro_dmg_: 15, }, // 2 piece heart of depth
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(184)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(209)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(250)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(257)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(275)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(328)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(198)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(3035)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(288)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(577)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(721)

        expect(formula.normal.flash(stats)[0](stats)).toApproximate(303)


        expect(formula.skill.skillDmg(stats)[0](stats)).toApproximate(1997)
        expect(formula.skill[0](stats)[0](stats)).toApproximate(1165)
        expect(formula.skill[1](stats)[0](stats)).toApproximate(1247)
        expect(formula.skill[2](stats)[0](stats)).toApproximate(1688)
        expect(formula.skill[3](stats)[0](stats)).toApproximate(1797)
        expect(formula.skill[4](stats)[0](stats)).toApproximate(1657)
        expect(formula.skill[5](stats)[0](stats)).toApproximate(1062)
        // expect(formula.skill[6](stats)[0](stats)).toApproximate(1062)//number is off, probably copy error
        expect(formula.skill.charged1(stats)[0](stats)).toApproximate(1804)
        expect(formula.skill.charged2(stats)[0](stats)).toApproximate(2157)

        expect(formula.skill.slash(stats)[0](stats)).toApproximate(1804)

        expect(formula.burst.melee(stats)[0](stats)).toApproximate(12114)
        expect(formula.burst.ranged(stats)[0](stats)).toApproximate(9879)
        expect(formula.burst.blast(stats)[0](stats)).toApproximate(3133)

      })
      test('riptide burst vs lvl78 hilichurls', () => {
        setupStats.physical_enemyRes_ = 10
        setupStats.enemyLevel = 78
        const stats = computeAllStats(setupStats)
        expect(formula.normal.burst(stats)[0](stats)).toApproximate(1546)
      })
    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(418)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(469)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(561)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(578)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(617)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(738)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(445)
        // expect(formula.charged.full(stats)[0](stats)).toApproximate(3817)//number is really off... should be 6817?
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(648)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1297)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1620)

        expect(formula.normal.flash(stats)[0](stats)).toApproximate(681)


        expect(formula.skill.skillDmg(stats)[0](stats)).toApproximate(4486)
        expect(formula.skill[0](stats)[0](stats)).toApproximate(2617)
        expect(formula.skill[1](stats)[0](stats)).toApproximate(2802)
        expect(formula.skill[2](stats)[0](stats)).toApproximate(3793)
        expect(formula.skill[3](stats)[0](stats)).toApproximate(4036)
        expect(formula.skill[4](stats)[0](stats)).toApproximate(3723)
        expect(formula.skill[5](stats)[0](stats)).toApproximate(2385)
        expect(formula.skill[6](stats)[0](stats)).toApproximate(2536)
        expect(formula.skill.charged1(stats)[0](stats)).toApproximate(4053)
        // expect(formula.skill.charged2(stats)[0](stats)).toApproximate(5847)//should be 4847? entry err

        expect(formula.skill.slash(stats)[0](stats)).toApproximate(4053)

        expect(formula.burst.melee(stats)[0](stats)).toApproximate(27210)
        expect(formula.burst.ranged(stats)[0](stats)).toApproximate(22190)
        expect(formula.burst.blast(stats)[0](stats)).toApproximate(7037)

      })
      test('riptide burst vs lvl78 hilichurls', () => {
        setupStats.physical_enemyRes_ = 10
        setupStats.enemyLevel = 78
        const stats = computeAllStats(setupStats)
        expect(formula.normal.burst(stats)[0](stats)).toApproximate(3472)
      })
    })
  })
})
