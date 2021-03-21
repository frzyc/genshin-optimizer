import { PreprocessFormulas } from "../../../StatData"
import { GetDependencies } from "../../../StatDependency"
import { applyArtifacts, createProxiedStats } from "../TestUtils"
import formula from "./data"

const baseStats = {
  characterHP: 8965, characterATK: 247, characterDEF: 563, 
  characterEle: "hydro", characterLevel: 77,
  weaponType: "catalyst", weaponATK: 421,
  enemyLevel: 76,

  enerRech_: 100 + 24 + 37.9,
  modifiers: Object.freeze({ hydro_dmg_: { enerRech_: 0.2 } }),

  talentLevelKeys: Object.freeze({ auto: 6 - 1, skill: 7 - 1, burst: 6 - 1 }),
}
const artifacts = [
  { hp: 2342, critRate_: 3.1, atk_: 9.3, enerRech_: 5.2, def_: 6.6 }, // Flower of Life
  { atk: 152, critRate_: 3.5, hp: 269, eleMas: 44, atk_: 4.7 }, // Plume of Death
  { atk_: 30.8, critDMG_: 7.8, atk: 18, def_: 5.8, hp_: 15.2 }, // Sands of Eon
  { hydro_dmg_: 30.8, critDMG_: 6.2, critRate_: 9.3, def: 21, eleMas: 19 }, // Goblet of Eonothem
  { critDMG_: 43.7, critRate_: 5.4, eleMas: 42, def: 39, def_: 7.3 }, // Circlet of Logos
  { hydro_dmg_: 15 } // Set
]

let setupStats, stats = {}
describe("Testing Mona's Formulas", () => {
  beforeEach(() => {
    stats = { ...setupStats } // This is fine so long as we don't mutate `modifier` or `talentLevelKeys`
    PreprocessFormulas(GetDependencies(stats.modifiers), stats).formula(stats)
  })

  describe("with artifacts", () => {
    beforeAll(() => {
      setupStats = createProxiedStats(baseStats)
      applyArtifacts(setupStats, artifacts)
    })
    afterAll(() => setupStats = undefined)

    test("overall stats", () => {
      expect(stats.finalHP).toApproximate(8965 + 3970)
      expect(stats.finalATK).toApproximate(668 + 469)
      expect(stats.finalDEF).toApproximate(563 + 171)
      expect(stats.eleMas).toApproximate(105)
      expect(stats.transformative_dmg_).toApproximate(46.4)
      expect(stats.amplificative_dmg_).toApproximate(19.4)
      expect(stats.critRate_).toApproximate(26.4)
      expect(stats.critDMG_).toApproximate(107.7)
      expect(stats.enerRech_).toApproximate(167.0)
      expect(stats.hydro_dmg_).toApproximate(79.2)
    })
    test("reactions", () => {
      expect(stats.electrocharged_hit).toApproximate(1388)
    })

    describe('no crit', () => {
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(483)
        expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(1926)
        expect(formula.skill.dot(skill, stats)[0](stats)).toApproximate(441)
      })

      describe("vaporize", () => {
        beforeAll(() => setupStats.reactionMode = "hydro_vaporize")
        afterAll(() => delete setupStats.reactionMode)

        test("hits", () => {
          const { auto } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(1155)
          expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(4599)
        })
      })
    })
    describe("crit", () => {
      beforeAll(() => setupStats.hitMode = "critHit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { skill } = stats.talentLevelKeys
        expect(formula.skill.dmg(skill, stats)[0](stats)).toApproximate(3802)
      })

      describe("vaporize", () => {
        beforeAll(() => setupStats.reactionMode = "hydro_vaporize")
        afterAll(() => delete setupStats.reactionMode)

        test("hits", () => {
          const { auto } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(2398)
          expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(9552)
        })
      })
    })
  })
})
