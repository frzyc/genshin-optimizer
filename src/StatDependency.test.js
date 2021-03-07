import { GetDependencies, GetFormulaDependency, reduceOptimizationTarget } from "./StatDependency"
import { StatData } from "./StatData"

expect.extend({
  /**
    * Test that the object respects the dependencies
    * @param {statKey[]} received - The sorted list of stat keys
    * @param {Object.<statKey, statKeys[]>} expected - The list of dependencies, all values must preceed its key to pass this test.
    */
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

describe('Testing StatDependency', () => {
  describe('GetFormulaDependency()', () => {
    test('should get dependencies from formula', () => {
      let operation = (s) => s.atk + s.def * s.hp
      expect(GetFormulaDependency(operation).sort()).toEqual(["atk", "def", "hp"].sort())
    })
  })
  describe('GetDependencies()', () => {
    test('should get dependencies from database', () => {
      expect(GetDependencies({}, ["finalDEF"])).toBeDependent({ finalDEF: ["characterDEF", "def_", "def"] })
    })
    test('should recursively get dependencies from database', () => {
      const expected = expect(GetDependencies({}, ["physical_normal_hit"]))
      expected.toBeDependent({
        physical_normal_hit: ["finalATK", "physical_dmg_", "normal_dmg_", "enemyLevel_multi", "physical_enemyRes_multi"],
        finalATK: ["baseATK", "atk_", "atk"],
        enemyLevel_multi: ["characterLevel", "enemyLevel"],
        physical_enemyRes_multi: ["physical_enemyImmunity", "physical_enemyRes_"],
        baseATK: ["characterATK", "weaponATK"],
      })
    })
    test('should add all dependencies from keys', () => {
      const expected = expect(GetDependencies({}, ["finalDEF", "enerRech_"]))
      expected.toBeDependent({
        finalDEF: ["characterDEF", "def_", "def"],
        enerRech_: []
      })
    })
    test(`should add all formulas' dependencies by default`, () => {
      expect(GetDependencies()).toEqual(expect.arrayContaining(Object.keys(StatData)))
    })
    test('should add modifiers if keys exists', () => {
      const keys = ["enerRech_"]
      let modifiers = { enerRech_: { critRate_: 10 } }
      //should add critRate_ to dependency
      expect(GetDependencies(modifiers, keys)).toBeDependent({ enerRech_: ["critRate_"] })
      modifiers = { atk: { critRate_: 10 } }
      //should not add critRate_ to dependency, since its not part of the original dependency
      expect(GetDependencies(modifiers, keys)).toEqual(expect.not.arrayContaining(["atk"]))
    })
    test('should respect modifiers for chained dependencies', () => {
      const modifiers = { hp: { def: 10 }, def: { enerRech_: 0 }, finalATK: { hp: 10 } }
      const expected = expect(GetDependencies(modifiers, ["finalATK"]))
      expected.toBeDependent({
        finalATK: ["hp"],
        hp: ["def"],
        def: ["enerRech_"],
      })
    })
    test('should contains unique dependencies', () => {
      const received = GetDependencies()
      expect([...new Set(received)]).toEqual(received)
    })
    test('should handle non-algebraic dependencies', () => {
      expect(GetDependencies({}, ["physical_enemyRes_multi"])).toBeDependent({
        physical_enemyRes_multi: ["physical_enemyImmunity", "physical_enemyRes_"]
      })
      expect(GetDependencies({}, ["amplificative_dmg_"])).toBeDependent({
        amplificative_dmg_: ["eleMas"]
      })

      const test_multi = (s) => {
        expect(GetDependencies({}, [s])).toBeDependent(Object.fromEntries([[s, ["characterLevel"]]]))
      }
      test_multi("overloaded_multi")
      test_multi("electrocharged_multi")
      test_multi("superconduct_multi")
      test_multi("swirl_multi")
      test_multi("shattered_multi")
      test_multi("crystalize_multi")
    })
  })
})

describe('reduceOptimizationTarget()', () => {
  test('should reduce', () => {
    const formula = { dmg: 0.6 }
    expect(reduceOptimizationTarget(formula)).toBe("dmg")
  })
  test('should not reduce complex formulas', () => {
    const formula = { dmg: { test: 0.6 } }
    expect(reduceOptimizationTarget(formula)).toBe(formula)
    const formula2 = { dmg: 0.6, test: 0.5 }
    expect(reduceOptimizationTarget(formula2)).toBe(formula2)
  })
})
