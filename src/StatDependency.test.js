import { GetDependencies, GetFormulaDependency } from "./StatDependency"
import { Formulas } from "./StatData"

describe('Testing StatDependency', () => {
  describe('GetFormulaDependency()', () => {
    test('should get dependencies from formula', () => {
      let operation = (s) => s.atk + s.def * s.hp
      expect(GetFormulaDependency(operation)).toEqual(["atk", "def", "hp"])
    })
  })
  describe('GetDependencies()', () => {
    test('should get first layer dependencies from formula', () => {
      const expected = ["def_base", "def_", "def", "def_final"]
      expect(GetDependencies({}, ["def_final"])).toEqual(expected)
    })
    test('should get all layer dependencies from formula', () => {
      const expected = ["atk_character_base", "atk_weapon", "atk_base", "atk_", "atk", "atk_final", "phy_dmg_bonus", "all_dmg_bonus", "phy_bonus_multi", "char_level", "enemy_level", "enemy_level_multi", "enemy_phy_immunity", "enemy_phy_res_multi", "phy_dmg"]
      expect(GetDependencies({}, ["phy_dmg"])).toEqual(expected)
    })
    test(`should add all formulas' dependencies by default`, () => {
      expect(GetDependencies()).toEqual(expect.arrayContaining(Object.keys(Formulas)))
    })
    test('should add all dependency from stats', () => {
      const keys = [ "def_final", "ener_rech" ], expected = ["def_base", "def_", "def", "def_final", "ener_rech"]
      expect(GetDependencies({}, keys)).toEqual(expected)
    })
    test('should add modifiers if keys exists', () => {
      const keys = ["ener_rech"]
      let modifiers = {
        ener_rech: {
          crit_rate: 10//should add critrate to dependency
        }
      }
      expect(GetDependencies(modifiers, keys)).toEqual(["crit_rate", "ener_rech"])
      modifiers = {
        atk: {//should not add critrate to dependency, since its not part of the original dependency
          crit_rate: 10
        }
      }
      expect(GetDependencies(modifiers, keys)).toEqual(["ener_rech"])
    })
    test('should include modifiers for chained dependencies', () => {
      const keys = ["att"]
      let modifiers = { hp: { def: 10 }, att: { hp: 10 } }
      expect(GetDependencies(modifiers, keys)).toEqual(["def", "hp", "att"])
    })
  })
})
