import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula from "./data"

let setupStats

// Discord ID: 83071788925325312
describe("Testing Chongyun's Formulas (sohum#5921)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 4574, characterATK: 93, characterDEF: 270,
      characterEle: "cryo", characterLevel: 40,
      weaponType: "claymore", weaponATK: 238,

      enerRech_: 39.7,
      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard

      tlvl: Object.freeze({ auto: 1 - 1, skill: 1 - 1, burst: 1 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 4780, critDMG_: 10.9, atk: 27, eleMas: 58, def: 37 }, // Flower of Life
      { atk: 258, hp_: 4.7, enerRech_: 11.0, critRate_: 2.7, critDMG_: 25.6 }, // Plume of Death
      { hp_: 30.8, atk: 33, critDMG_: 14.8, critRate_: 2.7, hp: 239 }, // Sands of Eon
      { cryo_dmg_: 46.6, critRate_: 2.7, atk: 37, eleMas: 33, hp: 837 }, // Goblet of Eonothem
      { critRate_: 25.8, eleMas: 35, def_: 18.2, hp: 269, hp_: 11.1 }, // Circlet of Logos
      { cryo_dmg_: 15, critRate_: 20 }, // 4-Piece Blizzard Strayer
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(62)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(56)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(73)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(739)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(612)
        expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(215)
      })

      describe("inside Spirit Blade: Chonghua's Layered Frost", () => {
        beforeEach(() => setupStats.infusionAura = "cryo")

        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(301)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(271)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(345)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(435)
        })
      })
    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(125)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(112)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(143)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(180)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1489)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1232)
        expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(432)
      })

      describe("inside Spirit Blade: Chonghua's Layered Frost", () => {
        beforeEach(() => setupStats.infusionAura = "cryo")

        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(606)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(546)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(695)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(876)
        })
      })
    })
  })
})

// Discord ID: 257579767388307468
describe("Testing Chongyun's Formulas (Derpy#2132)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 7725, characterATK: 157, characterDEF: 456,
      characterEle: "cryo", characterLevel: 60,
      weaponType: "claymore", weaponATK: 347,

      atk_: 12, enerRech: 50 + 50.5,
      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard

      tlvl: Object.freeze({ auto: 2 - 1, skill: 9 - 1, burst: 7 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3967, def: 35, atk: 18, enerRech_: 12.3, eleMas: 56 }, // Flower of Life
      { atk: 152, enerRech_: 5.2, eleMas: 23, hp: 448, atk_: 4.1 }, // Plume of Death
      { atk_: 6.3, hp_: 4.2, critRate_: 2.2 }, // Sands of Eon
      { cryo_dmg_: 34.8, hp_: 12.6, atk: 11, hp: 167 }, // Goblet of Eonothem
      { critRate_: 31.1, atk: 29, def: 19, hp_: 15.7, critDMG_: 14.0 }, // Circlet of Logos
      { burst_dmg_: 20 }, // 2 Pieces Noblesse Oblige
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(86)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(78)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(99)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(125)
        expect(formula.charged.spinning(stats)[0](stats)).toApproximate(69)
        expect(formula.charged.final(stats)[0](stats)).toApproximate(126)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1358)
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(1358)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1139)
      })
      test("C6", () => {
        setupStats.burst_dmg_ += 15
        const stats = computeAllStats(setupStats)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1266)
      })

      describe("inside Spirit Blade: Chonghua's Layered Frost", () => {
        beforeEach(() => setupStats.infusionAura = "cryo")

        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(351)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(317)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(403)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(508)
          expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(232)
        })

        describe("with Rimechaser Blade", () => {
          beforeEach(() => setupStats.cryo_enemyRes_ -= 10)

          test("hit", () => {
            const stats = computeAllStats(setupStats)
            expect(formula.normal[0](stats)[0](stats)).toApproximate(390)
            expect(formula.normal[1](stats)[0](stats)).toApproximate(352)
            expect(formula.normal[2](stats)[0](stats)).toApproximate(448)
            expect(formula.normal[3](stats)[0](stats)).toApproximate(565)
            expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(258)
            expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1509)
            expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1250)
          })

          test("C6", () => {
            setupStats.burst_dmg_ += 15
            const stats = computeAllStats(setupStats)
            expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1388)
          })
        })
      })
    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(142)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(128)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(163)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(206)
        expect(formula.charged.spinning(stats)[0](stats)).toApproximate(114)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2228)
        expect(formula.passive2.dmg(stats)[0](stats)).toApproximate(2228)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1868)
      })
      test("C6", () => {
        setupStats.burst_dmg_ += 15
        const stats = computeAllStats(setupStats)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(2076)
      })

      describe("inside Spirit Blade: Chonghua's Layered Frost", () => {
        beforeEach(() => setupStats.infusionAura = "cryo")

        test("hit", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(576)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(520)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(661)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(834)
          expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(380)
        })

        describe("with Rimechaser Blade", () => {
          beforeEach(() => setupStats.cryo_enemyRes_ -= 10)

          test("hit", () => {
            const stats = computeAllStats(setupStats)
            expect(formula.normal[0](stats)[0](stats)).toApproximate(640)
            expect(formula.normal[1](stats)[0](stats)).toApproximate(577)
            expect(formula.normal[2](stats)[0](stats)).toApproximate(735)
            expect(formula.normal[3](stats)[0](stats)).toApproximate(926)
            expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(423)
            expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2475)
            expect(formula.burst.dmg(stats)[0](stats)).toApproximate(2050)
          })
          test("C6", () => {
            setupStats.burst_dmg_ += 15
            const stats = computeAllStats(setupStats)
            expect(formula.burst.dmg(stats)[0](stats)).toApproximate(2277)
          })
        })
      })
    })
  })
})
