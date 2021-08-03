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
      const { initialStats, formula } = PreprocessFormulas(dependencyKeys, stat as any)
      formula(initialStats)
      expect(initialStats).toHaveProperty("finalDEF", 10 * 2 + 15);
    })
    test("should match Stat", () => {
      //checks for development
      expect(Object.keys(Formulas)).toEqual(expect.arrayContaining(Object.keys(FormulaText)))
      expect(Object.keys(StatData)).toEqual(expect.arrayContaining(Object.keys(Formulas)))
    })
  })
})
