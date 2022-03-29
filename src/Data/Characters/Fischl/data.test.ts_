import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5p5001045j03g04L07g0c5g03142L08K19r0a04u4g04245u0aI08L09h1a5g0g347B08E1aR14F0p5k09441d48R14035j08006004L60A025504Rust3L700101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Fischl's Formulas (sohum#5921)", () => {

  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 6463, characterATK: 560 - 388, characterDEF: 418,
      characterEle: "electro", characterLevel: 60,
      weaponType: "bow", weaponATK: 388, // Rust R1
      normal_dmg_: 40, charged_dmg_: -10,
      atk_: 34.1 + 12,// Rust R1 + specialized

      physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 3 - 1, skill: 9 - 1, burst: 9 - 1 }),
      constellation: 6,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { electro_dmg_: 15 }, // 2 piece thundering fury
    ]))

    describe("Ruin Guard level 85", () => {
      beforeEach(() => setupStats.enemyLevel = 85)

      describe("no crit", () => {
        beforeEach(() => setupStats.hitMode = "hit")

        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(144)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(152)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(189)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(188)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(235)
          expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(1233)

          expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(61)
          expect(formula.skill.activeChar(stats)[0](stats)).toApproximate(277)

          expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(740)

          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(3665)
          expect(formula.skill.oz(stats)[0](stats)).toApproximate(1396)
          expect(formula.burst.addDmg(stats)[0](stats)).toApproximate(2053)
        })
      })

      describe("crit", () => {
        beforeEach(() => setupStats.hitMode = "critHit")

        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(276)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(292)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(363)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(361)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(451)
          expect(formula.charged.aimShot(stats)[0](stats)).toApproximate(176)
          expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(2363)

          expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(118)
          expect(formula.skill.activeChar(stats)[0](stats)).toApproximate(531)

          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(7025)
          expect(formula.skill.oz(stats)[0](stats)).toApproximate(2676)
        })
      })
    })

    describe("Ruin Guard level 91", () => {
      beforeEach(() => setupStats.enemyLevel = 91)

      describe("no crit", () => {
        beforeEach(() => setupStats.hitMode = "hit")

        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(141)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(150)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(186)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(185)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(231)
          expect(formula.charged.aimShot(stats)[0](stats)).toApproximate(90)
          expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(1212)

          expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(60)
          expect(formula.skill.activeChar(stats)[0](stats)).toApproximate(272)

          expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(727)

          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(3602)
          expect(formula.skill.oz(stats)[0](stats)).toApproximate(1372)
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate(3215)
          expect(formula.burst.addDmg(stats)[0](stats)).toApproximate(2018)
        })
      })

      describe("crit", () => {
        beforeEach(() => setupStats.hitMode = "critHit")

        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(287)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(357)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(355)
          expect(formula.charged.aimShot(stats)[0](stats)).toApproximate(173)
          expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(2323)
          expect(formula.charged.fullAimedShotOz(stats)[0](stats)).toApproximate(3547)

          expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(116)
          expect(formula.skill.activeChar(stats)[0](stats)).toApproximate(522)

          expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(1394)

          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(6905)
          expect(formula.skill.oz(stats)[0](stats)).toApproximate(2630)
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate(6161)
          expect(formula.burst.addDmg(stats)[0](stats)).toApproximate(3868)
        })
      })
    })
  })
})
