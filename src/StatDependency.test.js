import { GetDependencies, GetFormulaDependency } from "./StatDependency"
import { Formulas } from "./StatData"

expect.extend({
  toBeDependent(received, expected) {
    for (const pivot in expected) {
      const index = received.indexOf(pivot)
      if (index === -1) return {
          message: () => `expected ${this.utils.printReceived(received)} to contain ${this.utils.printExpected(pivot)}`,
          pass: false,
      }
      const prefix = new Set(received.slice(0, index))
      for (const item of expected[pivot]) {
        if (!prefix.has(item)) return {
          message: () => `expected ${this.utils.printReceived(received)} to contain ${this.utils.printExpected(item)} before ${this.utils.printExpected(pivot)}`,
          pass: false
        }
      }
    }

    return {
      message: () => `expected ${this.utils.printReceived(received)} to break dependency of ${this.utils.printExpected(expected)}`,
      pass: true
    }
  },
})

function checkDependencies(dependencies, pivot, expected) {
  const index = dependencies.indexOf(pivot)
  expect(index).not.toEqual(-1)
  expect(dependencies.slice(0, index)).toEqual(expect.arrayContaining(expected))
}

describe('Testing StatDependency', () => {
  describe('GetFormulaDependency()', () => {
    test('should get dependencies from formula', () => {
      let operation = (s) => s.atk + s.def * s.hp
      expect(GetFormulaDependency(operation).sort()).toEqual(["atk", "def", "hp"].sort())
    })
  })
  describe('GetDependencies()', () => {
    test('should get dependencies from database', () => {
      expect(GetDependencies({}, ["def_final"])).toBeDependent({def_final: ["def_base", "def_", "def"]})
    })
    test('should recursively get dependencies from database', () => {
      const expected = expect(GetDependencies({}, ["phy_dmg"]))
      expected.toBeDependent({
        phy_dmg: ["atk_final", "phy_bonus_multi", "enemy_level_multi", "enemy_phy_res_multi"],
        atk_final: ["atk_base", "atk_", "atk"],
        phy_bonus_multi: ["phy_dmg_bonus", "all_dmg_bonus"],
        enemy_level_multi: ["char_level", "enemy_level"],
        enemy_phy_res_multi: ["enemy_phy_immunity", "enemy_phy_res"],
        atk_base: ["atk_character_base", "atk_weapon"],
      })
    })
    test('should add all dependencies from keys', () => {
      const expected = expect(GetDependencies({}, [ "def_final", "ener_rech" ]))
      expected.toBeDependent({
        def_final: ["def_base", "def_", "def"],
        ener_rech: []
      })
    })
    test(`should add all formulas' dependencies by default`, () => {
      expect(GetDependencies()).toEqual(expect.arrayContaining(Object.keys(Formulas)))
    })
    test('should add modifiers if keys exists', () => {
      const keys = ["ener_rech"]
      let modifiers = { ener_rech: { crit_rate: 10 } }
      //should add crit_rate to dependency
      expect(GetDependencies(modifiers, keys)).toBeDependent({ener_rech: ["crit_rate"]})
      modifiers = { atk: { crit_rate: 10 } }
      //should not add crit_rate to dependency, since its not part of the original dependency
      expect(GetDependencies(modifiers, keys)).toEqual(expect.not.arrayContaining(["atk"]))
    })
    test('should respect modifiers for chained dependencies', () => {
      const modifiers = { hp: { def: 10 }, def: { ener_rech: 0 }, atk_final: { hp: 10 } }
      const expected = expect(GetDependencies(modifiers, ["atk_final"]))
      expected.toBeDependent({
        atk_final: ["hp"],
        hp: ["def"],
        def: ["ener_rech"],
      })
    })
    test('should contains unique dependencies', () => {
      const received = GetDependencies()
      expect([...new Set(received)]).toEqual(received)
    })
    test('should handle non-algebraic dependencies', () => {
      expect(GetDependencies({}, ["norm_atk_crit_multi"])).toBeDependent({
        norm_atk_crit_multi: ["crit_rate", "norm_atk_crit_rate", "crit_dmg"]
      })
      expect(GetDependencies({}, ["char_atk_crit_multi"])).toBeDependent({
        char_atk_crit_multi: ["crit_rate", "char_atk_crit_rate", "crit_dmg"]
      })
      expect(GetDependencies({}, ["crit_multi"])).toBeDependent({
        crit_multi: ["crit_rate", "crit_dmg"]
      })
      expect(GetDependencies({}, ["skill_crit_multi"])).toBeDependent({
        skill_crit_multi: ["crit_rate", "skill_crit_rate", "crit_dmg"]
      })
      expect(GetDependencies({}, ["burst_crit_multi"])).toBeDependent({
        burst_crit_multi: ["crit_rate", "burst_crit_rate", "crit_dmg"]
      })
      expect(GetDependencies({}, ["enemy_phy_res_multi"])).toBeDependent({
        enemy_phy_res_multi: ["enemy_phy_immunity", "enemy_phy_res"]
      })
      expect(GetDependencies({}, ["amp_reaction_base_multi"])).toBeDependent({
        amp_reaction_base_multi: ["ele_mas"]
      })

      const test_multi = (s) => {
        expect(GetDependencies({}, [s])).toBeDependent(Object.fromEntries([[s, ["char_level"]]]))
      }
      test_multi("overloaded_multi")
      test_multi("electrocharged_multi")
      test_multi("superconduct_multi")
      test_multi("swirl_multi")
      test_multi("shatter_multi")
      test_multi("crystalize_multi")
    })
  })
})
