import { PreprocessFormulas } from "./StatData"

describe(`Testing StatData`, () => {
  describe(`PreprocessFormulas()`, () => {
    test(`basic def`, () => {
      const stat = {
        def_base: 10,
        def_: 100,
        def: 15
      }, dependencyKeys = ["def_final", "def_base", "def_", "def"]
      PreprocessFormulas(dependencyKeys)(stat)
      expect(stat).toHaveProperty("def_final", 10 * 2 + 15);
    })
    test(`modifiers`, () => {
      const stat = {
        testVal: 10,
        depVal1: 15,
        depval2: 20,
      }, modifiers = {
        testVal: {
          depVal1: 2,
          depval2: 3
        }
      }
      PreprocessFormulas(["depVal1", "depval2", "testVal"], modifiers)(stat)
      expect(stat).toHaveProperty("testVal", 10 + 15 * 2 + 20 * 3);
    })
    test('should not add modifier if its not part of the dependency list', () => {
      const stat = {
        testVal: 10,
        depVal1: 15,
        depval2: 20,
      }, modifiers = {
        testVal: {
          depVal1: 2,
          depval2: 3
        }
      }
      PreprocessFormulas(["depVal1", "depval2"], modifiers)(stat)
      expect(stat).toHaveProperty("testVal", 10);
    })
  })
})
