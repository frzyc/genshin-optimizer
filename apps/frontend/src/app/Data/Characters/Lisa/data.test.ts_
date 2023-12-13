import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5p4g03149R0aM14618A0p4g01047L0aU03g06z1p5g04446913j08E1aa3p4g08242f15f04B01D565g0g34aS08K11Y74F1f000004L60A00000cTwinNephrite4L40A2101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Lisa's Formulas (Derpy#2132)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 6731, characterATK: 370 - 207, characterDEF: 403,
      characterEle: "electro", characterLevel: 60,
      weaponType: "catalyst", weaponATK: 207, critRate_: 5 + 8.8,//Twin Nephrite R3
      eleMas: 48,//specialized

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 2 - 1, skill: 2 - 1, burst: 2 - 1 }),
      constellation: 1,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { electro_dmg_: 15, overloaded_dmg_: 40, electrocharged_dmg_: 40, superconduct_dmg_: 40 }, // 4 piece thundering-fury
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(234)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(212)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(253)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(325)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(1047)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(338)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(676)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(844)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(473)
        expect(formula.skill.stack0(stats)[0](stats)).toApproximate(1893)
        expect(formula.skill.stack1(stats)[0](stats)).toApproximate(2176)
        expect(formula.skill.stack2(stats)[0](stats)).toApproximate(2508)
        expect(formula.skill.stack3(stats)[0](stats)).toApproximate(2882)

        expect(formula.burst.summon(stats)[0](stats)).toApproximate(55)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(216)
      })
      test("hit + Q", () => {
        setupStats.enemyDEFRed_ += 15
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(254)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(231)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(275)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(353)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(1139)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(367)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(735)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(918)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(514)
        expect(formula.skill.stack0(stats)[0](stats)).toApproximate(2058)
        expect(formula.skill.stack1(stats)[0](stats)).toApproximate(2367)
        expect(formula.skill.stack2(stats)[0](stats)).toApproximate(2727)
        expect(formula.skill.stack3(stats)[0](stats)).toApproximate(3134)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(235)
      })
    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(450)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(408)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(487)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(625)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(2016)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(650)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1301)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1625)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(910)
        expect(formula.skill.stack0(stats)[0](stats)).toApproximate(3642)
        expect(formula.skill.stack1(stats)[0](stats)).toApproximate(4189)
        expect(formula.skill.stack2(stats)[0](stats)).toApproximate(4826)
        expect(formula.skill.stack3(stats)[0](stats)).toApproximate(5546)

        expect(formula.burst.summon(stats)[0](stats)).toApproximate(105)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(416)
      })
      test("hit + Q", () => {
        setupStats.enemyDEFRed_ += 15
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(490)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(444)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(529)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(680)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(2192)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(707)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1415)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1767)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(990)
        expect(formula.skill.stack0(stats)[0](stats)).toApproximate(3961)
        expect(formula.skill.stack1(stats)[0](stats)).toApproximate(4555)
        expect(formula.skill.stack2(stats)[0](stats)).toApproximate(5248)
        expect(formula.skill.stack3(stats)[0](stats)).toApproximate(6031)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(452)
      })
    })
  })
})
