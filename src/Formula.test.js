import Formula from "./Formula"
import { crawlObject } from "./Util/Util"
import './Data/Characters/index' //attaches field to formulas.
import { StatData } from "./StatData"

expect.extend({
  toBeValidFormula(formula, keys) {
    const formulaStr = `Formula.formulas.${keys.join('.')}`

    if (typeof formula !== "function") return {
      message: () => ` ${formulaStr} should  be a function: stats=>{...}`,
      pass: false
    }
    if (!formula.field) return {
      message: () => `${formulaStr}.field is lacking. All formula should be displayed in a field.`,
      pass: false
    }
    if (JSON.stringify(formula.keys) !== JSON.stringify(keys)) return {
      message: () => `${formulaStr}.keys is invalid. ${JSON.stringify(formula.keys)} vs. ${JSON.stringify(keys)}`,
      pass: false
    }
    const stats = { hitMode: "avgHit", tlvl: { auto: 0, skill: 0, burst: 0 } }
    const [targetFormula, dependencies] = formula(stats)
    expect(Array.isArray(dependencies))
    expect(typeof targetFormula({}, stats)).toBe("number")
    dependencies.forEach((dependency) => expect(Object.keys(StatData)).toContain(dependency))
    return {
      message: () => `${formulaStr} is valid.`,
      pass: true
    }
  },
})
test('validate formulas', () => {
  crawlObject(Formula.formulas, [], f => typeof f === "function", (formula, keys) => {
    expect(formula).toBeValidFormula(keys)
  })
})
