import { artifactSetPermutations, calculateTotalBuildNumber } from "./Build"

const mock = (setKey) => { return { setKey } }

describe(`Testing Build`, () => {
  describe(`artifactSetPermutations()`, () => {
    test(`should separate slots by filter`, () => {
      const artifacts = {
        flower: [mock("A"), mock("A"), mock("B"), mock("C"), mock("D")],
        plume: [mock("A"), mock("B"), mock("C")],
        sand: [mock("A"), mock("A"), mock("B")],
      }
      const filter = [{ key: "A", num: 0 }, { key: "B", num: 0 }]
      // "A" artifacts are grouped together, and "C" and "D" are counted as "Other"
      // flower - 3, plume - 3, sand - 2
      expect([...artifactSetPermutations(artifacts, filter)]).toHaveLength(3 * 3 * 2)
    })
    test(`should exclude unsatisfied permutations`, () => {
      const artifacts = {
        flower: [mock("A"), mock("B")],
        plume: [mock("A"), mock("B")],
        sand: [mock("A"), mock("B")],
      }
      const filter = [{ key: "A", num: 2 }]
      // AAO, AOA, OAA, AAA
      let result = [...artifactSetPermutations(artifacts, filter)].map(s => Object.entries(s).map(i => i[1][0].setKey).join(''))
      expect(new Set(result)).toEqual(new Set(["AAA", "AAB", "ABA", "BAA"]))
    })
    test(`should yield nothing on unsatisfiable filter`, () => {
      const artifacts = {
        flower: [mock("A"), mock("B")],
        plume: [mock("A"), mock("B")],
        sand: [mock("A"), mock("B")],
      }
      const filter = [{ key: "A", num: 2 }, { key: "B", num: 2 }]
      expect([...artifactSetPermutations(artifacts, filter)]).toHaveLength(0)
    })
  })
  describe(`calculateTotalBuildNumber()`, () => {
    test(`should count all combinations`, () => {
      const artifacts = {
        flower: [mock("A"), mock("B"), mock("C"), mock("D")],
        plume: [mock("A"), mock("B"), mock("C")],
        sand: [mock("A"), mock("B")],
      }
      const filter = [{ key: "A", num: 0 }, { key: "B", num: 0 }]
      expect(calculateTotalBuildNumber(artifacts, filter)).toEqual(4 * 3 * 2)
      expect(calculateTotalBuildNumber(artifacts, [])).toEqual(4 * 3 * 2)
    })
    test(`should exclude unsatisfied permutations`, () => {
      const artifacts = {
        flower: [mock("A"), mock("A"), mock("B"), mock("C"), mock("D")],
        plume: [mock("A"), mock("B"), mock("C")],
        sand: [mock("A"), mock("A"), mock("B")],
      }
      const filter = [{ key: "A", num: 2 }]
      // AAO - 2*1*1, AOA - 2*2*2, OAA - 3*1*2, AAA - 2*1*2
      expect(calculateTotalBuildNumber(artifacts, filter)).toEqual(2*1*1 + 2*2*2 + 3*1*2 + 2*1*2)
    })
  })
})
