import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"
import cformula from '../../Weapons/Polearm/CrescentPike/data'

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5g5g01045z03i08X17U035g04449a1a-06W08E235g04243v0511921ae1g4g03145x09L08L0aY145k0e343x02621u7aS0v000004L70A03332iphysical_enemyRes_270aenemyLevel285cCrescentPike3L700101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Tartaglia's Formulas (Derpy#2132)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10040, characterATK: 625 - 429, characterDEF: 580,
      characterEle: "cryo", characterLevel: 70,
      weaponType: "polearm", weaponATK: 429, physical_dmg_: 28.4, weapon: { refineIndex: 1 - 1 } as any,//Crescent Pike Lvl. 70 (Refinement 1)
      atk_: 18,//specialized

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 4 - 1, skill: 4 - 1, burst: 4 - 1 }),
      constellation: 0,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { burst_dmg_: 20, cryo_dmg_: 15 }, // 2 NO 2 Blizzard
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      describe('non C6', () => {
        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(189)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(186)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(115)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(252)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(150)
          expect(formula.normal[5](stats)[0](stats)).toApproximate(155)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(495)
          expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(231)
          expect(formula.plunging.low(stats)[0](stats)).toApproximate(462)
          expect(formula.plunging.high(stats)[0](stats)).toApproximate(578)

          expect(formula.skill.hit1(stats)[0](stats)).toApproximate(780)
          expect(formula.skill.hit2(stats)[0](stats)).toApproximate(1816)

          expect(formula.burst.hit1(stats)[0](stats)).toApproximate(1561)
          expect(formula.burst.hit2(stats)[0](stats)).toApproximate(2281)
          expect(formula.burst.dot(stats)[0](stats)).toApproximate(1981)
          //crecent pike
          expect(cformula.dmg(stats)[0](stats)).toApproximate(56)
        })
        test("cryo_melt", () => {
          setupStats.reactionMode = "cryo_melt"
          const stats = computeAllStats(setupStats)
          expect(formula.skill.hit1(stats)[0](stats)).toApproximate(1295)
          expect(formula.skill.hit2(stats)[0](stats)).toApproximate(3016)

          expect(formula.burst.hit1(stats)[0](stats)).toApproximate(2592)
          expect(formula.burst.hit2(stats)[0](stats)).toApproximate(3788)
          expect(formula.burst.dot(stats)[0](stats)).toApproximate(3290)
        })
      })
      describe('Sim C6', () => {
        beforeEach(() => setupStats.physical_enemyRes_ -= 20)
        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(316)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(311)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(192)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(420)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(251)
          expect(formula.normal[5](stats)[0](stats)).toApproximate(259)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(825)
          expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(385)
          expect(formula.plunging.low(stats)[0](stats)).toApproximate(771)
          expect(formula.plunging.high(stats)[0](stats)).toApproximate(963)
          //crecent pike
          expect(cformula.dmg(stats)[0](stats)).toApproximate(94)

        })
      })
    })

    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      describe('non C6', () => {
        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(345)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(339)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(209)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(458)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(274)
          expect(formula.normal[5](stats)[0](stats)).toApproximate(283)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(900)
          expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(421)
          expect(formula.plunging.low(stats)[0](stats)).toApproximate(841)
          expect(formula.plunging.high(stats)[0](stats)).toApproximate(1051)

          expect(formula.skill.hit1(stats)[0](stats)).toApproximate(1418)
          expect(formula.skill.hit2(stats)[0](stats)).toApproximate(3304)

          expect(formula.burst.hit1(stats)[0](stats)).toApproximate(2839)
          expect(formula.burst.hit2(stats)[0](stats)).toApproximate(4150)
          expect(formula.burst.dot(stats)[0](stats)).toApproximate(3604)
          //crecent pike
          expect(cformula.dmg(stats)[0](stats)).toApproximate(102)

        })
        test("cryo_melt", () => {
          setupStats.reactionMode = "cryo_melt"
          const stats = computeAllStats(setupStats)
          expect(formula.skill.hit1(stats)[0](stats)).toApproximate(2355)
          expect(formula.skill.hit2(stats)[0](stats)).toApproximate(5486)

          expect(formula.burst.hit1(stats)[0](stats)).toApproximate(4714)
          expect(formula.burst.hit2(stats)[0](stats)).toApproximate(6890)
          expect(formula.burst.dot(stats)[0](stats)).toApproximate(5983)
        })
      })
      describe('Sim C6', () => {
        beforeEach(() => setupStats.physical_enemyRes_ -= 20)
        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(575)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(566)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(349)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(764)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(456)
          expect(formula.normal[5](stats)[0](stats)).toApproximate(471)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(1500)
          expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(701)
          expect(formula.plunging.low(stats)[0](stats)).toApproximate(1403)
          expect(formula.plunging.high(stats)[0](stats)).toApproximate(1752)
          //crecent pike
          expect(cformula.dmg(stats)[0](stats)).toApproximate(171)

        })
      })
    })
  })
})
