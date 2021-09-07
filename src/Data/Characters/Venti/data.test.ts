import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"
import cformula from '../../Weapons/Bow/TheViridescentHunt/data'

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5t5k0824a-09N11L35h1t5k0d341U86c3a-0921t5k0a4419c7k15l09D065k0104a613v09824F0t5g0314aS04W06c3961p202004L70A03662iphysical_enemyRes_270aenemyLevel285iTheViridescentHunt3L800101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Venti's Formulas (Derpy#2132)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 8557, characterATK: 663 - 449, characterDEF: 543,
      characterEle: "anemo", characterLevel: 70,
      weaponType: "bow", weaponATK: 449, critRate_: 5 + 25.1, weapon: { refineIndex: 1 - 1 } as any,//The Viridescent Hunt Lvl. 90 (Refinement 1)
      enerRech: 24,//specialized

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 4 - 1, skill: 7 - 1, burst: 7 - 1 }),
      constellation: 1,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { anemo_dmg_: 15, swirl_dmg_: 60 }, // 4VV
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(38)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(82)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(97)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(48)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(94)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(132)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(81)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(1098)
        expect(formula.charged.hit_bonus(stats)[0](stats)).toApproximate(27)
        expect(formula.charged.full_bonus(stats)[0](stats)).toApproximate(362)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(106)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(212)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(265)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(2933)
        expect(formula.skill.hold(stats)[0](stats)).toApproximate(4038)

        expect(formula.burst.hit(stats)[0](stats)).toApproximate(399)
        expect(formula.burst.pyro(stats)[0](stats)).toApproximate(123)

        expect(cformula.dmg(stats)[0](stats)).toApproximate(58)


      })

      test('C2', () => {
        setupStats.anemo_enemyRes_ -= 12
        setupStats.physical_enemyRes_ -= 12
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(53)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(116)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(137)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(68)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(132)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(185)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(114)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(1232)
        expect(formula.charged.hit_bonus(stats)[0](stats)).toApproximate(37)
        expect(formula.charged.full_bonus(stats)[0](stats)).toApproximate(406)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(148)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(297)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(371)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(3291)
        expect(formula.skill.hold(stats)[0](stats)).toApproximate(4531)

        expect(formula.burst.hit(stats)[0](stats)).toApproximate(448)

        expect(cformula.dmg(stats)[0](stats)).toApproximate(81)
      })

    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(90)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(196)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(232)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(115)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(224)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(314)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(194)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(2603)
        expect(formula.charged.hit_bonus(stats)[0](stats)).toApproximate(64)
        expect(formula.charged.full_bonus(stats)[0](stats)).toApproximate(859)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(251)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(503)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(628)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(6953)
        expect(formula.skill.hold(stats)[0](stats)).toApproximate(9573)

        expect(formula.burst.hit(stats)[0](stats)).toApproximate(947)
        expect(formula.burst.pyro(stats)[0](stats)).toApproximate(293)

        expect(cformula.dmg(stats)[0](stats)).toApproximate(138)
      })
      test('C2', () => {
        setupStats.anemo_enemyRes_ -= 12
        setupStats.physical_enemyRes_ -= 12
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(126)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(275)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(324)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(161)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(314)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(440)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(272)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(2921)
        expect(formula.charged.hit_bonus(stats)[0](stats)).toApproximate(89)
        expect(formula.charged.full_bonus(stats)[0](stats)).toApproximate(964)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(352)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(704)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(880)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(7803)
        expect(formula.skill.hold(stats)[0](stats)).toApproximate(10743)

        expect(formula.burst.hit(stats)[0](stats)).toApproximate(1063)

        expect(cformula.dmg(stats)[0](stats)).toApproximate(194)
      })
    })
  })
})
