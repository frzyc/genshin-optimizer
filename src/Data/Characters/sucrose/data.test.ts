import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula from "./data"

let setupStats

// Discord ID: 822274940547629077
describe("Testing Sucrose's Formulas (firedragon2508#8862)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 8192, characterATK: 151, characterDEF: 623,
      characterEle: "anemo", characterLevel: 80,
      weaponType: "catalyst", weaponATK: 448,

      anemo_dmg_: 18, critDMG_: 50 + 50.3,

      tlvl: Object.freeze({ auto: 6 - 1, skill: 9 - 1, burst: 10 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 4171, atk_: 17.5, def_: 5.8, eleMas: 23, enerRech_: 10.4 }, // Flower of Life
      { atk: 311, hp: 986, critRate_: 7, eleMas: 21, enerRech_: 6.5 }, // Plume of Death
      { eleMas: 155, atk_: 9.3, atk: 53, critDMG_: 7.8, hp: 239 }, // Sands of Eon
      { anemo_dmg_: 46.6, atk: 27, def: 35, atk_: 4.5, hp: 657 }, // Goblet of Eonothem
      { atk_: 46.6, critDMG_: 5.4, def: 21, enerRech_: 22.0, critRate_: 5.8 }, // Circlet of Logos
      { anemo_dmg_: 15, swirl_dmg_: 60 }, // Viridescent Venerer 4 Pieces Set
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.finalHP).toApproximate(14245)
      expect(stats.finalATK).toApproximate(1458)
      expect(stats.finalDEF).toApproximate(715)
      expect(stats.eleMas).toApproximate(199)
      expect(stats.critRate_).toApproximate(17.8)
      expect(stats.critDMG_).toApproximate(113.50)
      expect(stats.enerRech_).toApproximate(138.9)
      expect(stats.anemo_dmg_).toApproximate(79.6)
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      describe("Electro Hypostasis lvl 93", () => {
        beforeEach(() => setupStats.enemyLevel = 93)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(532)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(487)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(612)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(762)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(1913)
          expect(formula.skill.press(stats)[0](stats)).toApproximate(4082)
          expect(formula.burst.dot(stats)[0](stats)).toApproximate(3029)
        })
      })

      describe("Hilichurl lvl 86", () => {
        beforeEach(() => setupStats.enemyLevel = 86)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(545)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(499)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(627)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(781)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(1960)
          expect(formula.skill.press(stats)[0](stats)).toApproximate(4183)
          expect(formula.burst.dot(stats)[0](stats)).toApproximate(3104)
        })
      })
    })
  })

  describe("without artifacts", () => {
    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      describe("Ruin Guard lvl 85", () => {
        beforeEach(() => setupStats.enemyLevel = 85)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(147)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(134)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(168)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(210)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(527)
          expect(formula.skill.press(stats)[0](stats)).toApproximate(1126)
          expect(formula.burst.dot(stats)[0](stats)).toApproximate(836)
        })
      })
      describe("Electro Hypostasis lvl 93", () => {
        beforeEach(() => setupStats.enemyLevel = 93)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(145)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(132)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(166)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(207)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(520)
          expect(formula.skill.press(stats)[0](stats)).toApproximate(1111)
          expect(formula.burst.dot(stats)[0](stats)).toApproximate(824)
        })
      })
    })
  })
})
