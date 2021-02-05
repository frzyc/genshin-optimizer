import { GetDependencies, GetFormulaDependency, InsertDependencies } from "./StatDependency"
describe('Testing StatDependency', () => {
  describe('GetFormulaDependency()', () => {
    test('should get dependencies from formula', () => {
      let operation = (s) => s.atk + s.def * s.hp
      expect(GetFormulaDependency(operation)).toEqual(["atk", "def", "hp"])
    })
  })
  describe('InsertDependencies()', () => {
    test('should get first layer dependencies from formula', () => {
      expect(InsertDependencies("def_final")).toEqual(new Set(["def_base", "def_", "def", "def_final"]))
    })
    test('should get all layer dependencies from formula', () => {
      const expectedDep = new Set(["atk_base", "atk_character_base", "atk_weapon", "atk_", "atk", "atk_final", "phy_dmg_bonus", "all_dmg_bonus", "phy_bonus_multi", "char_level", "enemy_level", "enemy_level_multi", "enemy_phy_immunity", "enemy_phy_res_multi", "phy_dmg"])
      expect(InsertDependencies("phy_dmg")).toEqual(expectedDep)
    })
  })
  describe('GetDependencies()', () => {
    test(`should add all formulas' dependencies by default`, () => {
      expect(GetDependencies().length).toBeGreaterThan(0)
    })
    test('should add all dependency from stats', () => {
      const keys = [
        "def_final",
        "ener_rech",
      ]
      expect(GetDependencies({}, keys)).toEqual(["def_base", "def_", "def", "def_final", "ener_rech"])
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
  })
})
