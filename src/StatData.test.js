import { PreprocessFormulas, Formulas, StatData } from "./StatData"
import { FormulaText } from "./Stat"

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
    test("should match Stat", () => {
      //checks for development
      expect(Object.keys(Formulas)).toEqual(expect.arrayContaining(Object.keys(FormulaText)))
      expect(Object.keys(StatData)).toEqual(expect.arrayContaining(Object.keys(Formulas)))
    })
  })
})
