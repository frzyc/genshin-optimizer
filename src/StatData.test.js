import { PreprocessFormulas, StatData } from "./StatData"
import { GetDependencies } from "./StatDependency"

describe(`Testing StatData`, () => {
  describe(`PreprocessFormulas()`, () => {
    test(`basic def`, () => {
      const stat = {
        characterDEF: 10,
        def_: 100,
        def: 15
      }, dependencyKeys = ["characterDEF", "def_", "def", "finalDEF"]
      const { initialStats, formula } = PreprocessFormulas(dependencyKeys, stat)
      formula(initialStats)
      expect(initialStats).toHaveProperty("finalDEF", 10 * 2 + 15);
    })
    test(`modifiers`, () => {
      const stat = {
        testVal: 10,
        depVal1: 15,
        depval2: 20,
        modifiers: {
          testVal: {
            depVal1: 2,
            depval2: 3,
          },
        },
      }
      const { initialStats, formula } = PreprocessFormulas(["depVal1", "depval2", "testVal"], stat)
      formula(initialStats)
      expect(initialStats).toHaveProperty("testVal", 10 + 15 * 2 + 20 * 3);
    })
    test("should add modifier if it's part of the dependency list", () => {
      const stat = {
        testVal: 10,
        depVal1: 15,
        depval2: 20,
        modifiers: {
          testVal: {
            depVal1: 2,
            depval2: 3,
          },
        },
      }
      const { initialStats, formula } = PreprocessFormulas(["depVal1", "depval2", "testVal"], stat)
      formula(initialStats)
      expect(initialStats).toHaveProperty("testVal", 10 + 15 * 2 + 20 * 3);
    })
    test('should compute correct result', () => {
      const stat = {
        characterHP: 8965, characterATK: 247, characterDEF: 563, critRate_: 5,
        characterLevel: 77,

        weaponATK: 421, enemyLevel: 76,

        hp: 0, hp_: 0, atk: 0, atk_: 0, def: 0, def_: 0,
        critRate_: 5, critDMG_: 50, enerRech_: 100 + 24 + 37.9, eleMas: 0,
        hydro_dmg_: 0,

        // C1
        electrocharged_dmg_: 15, vaporized_dmg_: 15, hydro_swirl_dmg_: 15,
        modifiers: {
          hydro_dmg_: { enerRech_: 0.2 },
        },
      }, targets = [
        "finalHP", "finalATK", "finalDEF", "critRate_",
        "transformative_dmg_", "amplificative_dmg_",
        "hydro_normal_hit", "hydro_charged_hit",
        "hydro_skill_hit", "hydro_skill_critHit",
        "hydro_vaporize_normal_hit", "hydro_vaporize_normal_critHit",
        "hydro_vaporize_charged_hit", "hydro_vaporize_charged_critHit",
        "electrocharged_hit"
      ]

      // Flower of Life
      stat.hp += 2342
      stat.critRate_ += 3.1
      stat.atk_ += 9.3
      stat.enerRech_ += 5.2
      stat.def_ += 6.6
      // Plume of Death
      stat.atk += 152
      stat.critRate_ += 3.5
      stat.hp += 269
      stat.eleMas += 44
      stat.atk_ += 4.7
      // Sand of Eon
      stat.atk_ += 30.8
      stat.critDMG_ += 7.8
      stat.atk += 18
      stat.def_ += 5.8
      stat.hp_ += 15.2
      // Goblet of Eonothem
      stat.hydro_dmg_ += 30.8
      stat.critDMG_ += 6.2
      stat.critRate_ += 9.3
      stat.def += 21
      stat.eleMas += 19
      // Circlet of Logos
      stat.critDMG_ += 43.7
      stat.critRate_ += 5.4
      stat.eleMas += 42
      stat.def += 39
      stat.def_ += 7.3

      // Set
      stat.hydro_dmg_ += 15

      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)

      function test(calculated, experiment, percentMargin = 0.38) {
        expect((calculated / experiment - 1) / percentMargin / 2).toBeCloseTo(0)
      }
      test(stat.finalHP, 8965 + 3970)
      test(stat.finalATK, 668 + 469)
      test(stat.finalDEF, 563 + 171)
      test(stat.eleMas, 105)
      test(stat.transformative_dmg_, 46.4)
      test(stat.amplificative_dmg_, 19.4)
      test(stat.critRate_, 26.4)
      test(stat.critDMG_, 107.7)
      test(stat.enerRech_, 167.0)
      test(stat.hydro_dmg_, 79.2)

      // Experiment Data
      test(stat.hydro_normal_hit * 0.526, 483)
      test(stat.hydro_charged_hit * 2.1, 1926)
      test(stat.hydro_skill_hit * 0.48, 441)
      test(stat.hydro_skill_critHit * 1.99, 3802)
      test(stat.hydro_vaporize_normal_hit * 0.526, 1155)
      test(stat.hydro_vaporize_normal_critHit * 0.526, 2398)
      test(stat.hydro_vaporize_charged_hit * 2.1, 4599)
      test(stat.hydro_vaporize_charged_critHit * 2.1, 9552)
      test(stat.electrocharged_hit, 1388, 0.75) // Inaccurate
    })
  })
})
