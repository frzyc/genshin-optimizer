import { KeyPath } from "../../../Util/KeyPathUtil"
import { FormulaPathBase } from "../../formula"
import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula from "./data"

let setupStats

describe("Testing Mona's Formulas", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 8965, characterATK: 247, characterDEF: 563,
      characterEle: "hydro", characterLevel: 77,
      weaponType: "catalyst", weaponATK: 421,
      enemyLevel: 76,

      enerRech_: 100 + 24 + 37.9,
      modifiers: Object.freeze({ hydro_dmg_: [KeyPath<FormulaPathBase, any>().character.Mona.passive2.bonus()] }),

      tlvl: Object.freeze({ auto: 6 - 1, skill: 7 - 1, burst: 6 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 2342, critRate_: 3.1, atk_: 9.3, enerRech_: 5.2, def_: 6.6 }, // Flower of Life
      { atk: 152, critRate_: 3.5, hp: 269, eleMas: 44, atk_: 4.7 }, // Plume of Death
      { atk_: 30.8, critDMG_: 7.8, atk: 18, def_: 5.8, hp_: 15.2 }, // Sands of Eon
      { hydro_dmg_: 30.8, critDMG_: 6.2, critRate_: 9.3, def: 21, eleMas: 19 }, // Goblet of Eonothem
      { critDMG_: 43.7, critRate_: 5.4, eleMas: 42, def: 39, def_: 7.3 }, // Circlet of Logos
      { hydro_dmg_: 15 } // Set
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.finalHP).toApproximate(8965 + 3970)
      expect(stats.finalATK).toApproximate(668 + 469)
      expect(stats.finalDEF).toApproximate(563 + 171)
      expect(stats.eleMas).toApproximate(105)
      expect(stats.amplificative_dmg_).toApproximate(19.4)
      expect(stats.critRate_).toApproximate(26.4)
      expect(stats.critDMG_).toApproximate(107.7)
      expect(stats.enerRech_).toApproximate(167.0)
      expect(stats.hydro_dmg_).toApproximate(79.2)
    })

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(483)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(1926)
        expect(formula.skill.dot(stats)[0](stats)).toApproximate(441)
      })

      describe("vaporize", () => {
        beforeEach(() => setupStats.reactionMode = "hydro_vaporize")

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(1155)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(4599)
        })
      })
    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(3802)
      })

      describe("vaporize", () => {
        beforeEach(() => setupStats.reactionMode = "hydro_vaporize")

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(2398)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(9552)
        })
      })
    })
  })
})
