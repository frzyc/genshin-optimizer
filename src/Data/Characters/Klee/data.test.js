import { PreprocessFormulas } from "../../../StatData"
import { GetDependencies } from "../../../StatDependency"
import { applyArtifacts, createProxiedStats } from "../TestUtils"
import formula from "./data"

const baseStats = {
  characterHP: 8429, characterATK: 254, characterDEF: 504,
  characterEle: "pyro", characterLevel: 71,
  weaponType: "catalyst", weaponATK: 421,
  enemyLevel: 82,
  
  enerRech_: 137.9, pyro_dmg_: 21.6,
  
  talentLevelKeys: Object.freeze({ auto: 6 - 1, skill: 6 - 1, burst: 6 - 1 }),
}
const artifacts = [
  { hp: 2108, critDMG_: 5.6, def: 19, atk_: 4.7, enerRech_: 4.1 }, // Flower of Life
  { atk: 205, atk_: 4.7, def: 58, enerRech_: 11.0, eleMas: 19 }, // Plume of Death
  { eleMas: 123, hp_: 5.3, hp: 269, atk: 35, def_: 13.1 }, // Sands of Eon
  { anemo_dmg_: 13.4, critRate_: 2.2, eleMas: 17, def: 17 }, // Goblet of Eonothem
  { atk_: 30.8, def_: 7.3, critRate_: 3.1, hp_: 15.2, enerRech_: 6.5 }, // Circlet of Logos
  { eleMas: 80 }, // Instructor Set
  { eleMas: 80 }, // Wanderer's Troupe Set
]

let setupStats, stats = {}
describe("Testing Klee's Formulas", () => {
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
      expect(stats.finalHP).toApproximate(12527)
      expect(stats.finalATK).toApproximate(1186)
      expect(stats.finalDEF).toApproximate(700)
      expect(stats.eleMas).toApproximate(319)
      expect(stats.critRate_).toApproximate(10.3)
      expect(stats.critDMG_).toApproximate(55.6)
      expect(stats.enerRech_).toApproximate(159.5)
    })
    test("reactions", () => {
      expect(stats.overloaded_hit).toApproximate(2986, NaN) // TODO: Check the overloaded calculation
    })

    describe("no crit", () => {
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill, burst } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(635)
        expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(549)
        expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(791)
        expect(formula.charged.dmg(auto, stats)[0](stats)).toApproximate(1385)
        expect(formula.skill.jumpyDmg(skill, stats)[0](stats)).toApproximate(838)
        expect(formula.skill.mineDmg(skill, stats)[0](stats)).toApproximate(288)
        expect(formula.burst.dmg(burst, stats)[0](stats)).toApproximate(375)
      })
      describe("with explosive spark", () => {
        beforeAll(() => setupStats.charged_dmg_ += 50)
        afterAll(() => setupStats.charged_dmg_ -= 50)

        test("hits", () => {
          const { auto } = stats.talentLevelKeys
          expect(formula.charged.dmg(auto, stats)[0](stats)).toApproximate(1955)
        })
      })

      describe("with vaporize", () => {
        beforeAll(() => setupStats.reactionMode = "pyro_vaporize")
        afterAll(() => delete setupStats.reactionMode)

        test("hits", () => {
          const { auto, skill, burst } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(1444)
          expect(formula.charged.dmg(auto, stats)[0](stats)).toApproximate(3149)
          expect(formula.skill.jumpyDmg(skill, stats)[0](stats)).toApproximate(1905)
          expect(formula.burst.dmg(burst, stats)[0](stats)).toApproximate(853)
        })
      })
      describe("with melt", () => {
        beforeAll(() => setupStats.reactionMode = "pyro_melt")
        afterAll(() => delete setupStats.reactionMode)

        test("hits", () => {
          const { auto } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(1925)
          expect(formula.charged.dmg(auto, stats)[0](stats)).toApproximate(4199)
        })
      })
    })
    describe("with crit", () => {
      beforeAll(() => setupStats.hitMode = "critHit" )
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill, burst } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(988)
        expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(855)
        expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(1232)
        expect(formula.skill.jumpyDmg(skill, stats)[0](stats)).toApproximate(1304)
        expect(formula.burst.dmg(burst, stats)[0](stats)).toApproximate(584)
      })

      describe("with explosive spark", () => {
        beforeAll(() => setupStats.charged_dmg_ += 50)
        afterAll(() => setupStats.charged_dmg_ -= 50)

        test("hits", () => {
          const { auto } = stats.talentLevelKeys
          expect(formula.charged.dmg(auto, stats)[0](stats)).toApproximate(3042)
        })
      })
    })
  })
})