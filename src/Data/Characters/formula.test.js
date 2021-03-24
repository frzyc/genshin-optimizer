import formula from './formula'
import { StatData } from '../../StatData'

describe(`Testing Character Formula`, () => {
  describe(`formula`, () => {
    test(`every entry is 3-layer deep`, () => {
      const stats = { hitMode: "avgHit", tlvl: { auto: 0, skill: 0, burst: 0 } }
      for (const [char, charFormula] of Object.entries(formula)) {
        for (const [move, moveFormula] of Object.entries(charFormula)) {
          for (const [subMove, formula] of Object.entries(moveFormula)) {
            // console.log("Testing", char, move, subMove) // For testing
            const [targetFormula, dependencies] = formula(stats)
            expect(dependencies.isArray)
            expect(typeof targetFormula({}, stats)).toBe("number")
            dependencies.forEach((dependency) => expect(Object.keys(StatData)).toContain(dependency))
          }
        }
      }
    })
  })
})