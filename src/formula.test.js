//testing the theory behind the options for function presentation

const talent = [1.5, 2.5, 3.5, 4.5]
const stat = {
  dmg_multi: 123.45
}
const skillIndex = 2
const objFormulaParser = (obj, stats) => Object.entries(obj).reduce((a, [key, value]) =>
  a + stats[key] * (typeof value === "object" ? objFormulaParser(value, stats) : value), 0)
describe('Testing functions', () => {
  test('should do serialized function', () => {
    const formula = `return stat["dmg_multi"] * ${talent[skillIndex]}`
    const func = new Function("stat", formula)
    const result = func(stat)
    expect(result).toBe(123.45 * talent[skillIndex])
  })
  test('should do obj parsing', () => {
    const formula = { dmg_multi: talent[skillIndex] }
    const result = objFormulaParser(formula, stat)
    expect(result).toBe(123.45 * talent[skillIndex])
  })
})

const complexStat = {
  atkFinal: 500,
  hpFinal: 1000,
  dmg_multi: 1.2345
}
const hp_multi = 0.015
const expectedVal = (complexStat["atkFinal"] * talent[skillIndex] + complexStat["hpFinal"] * hp_multi) * complexStat["dmg_multi"]
describe('Testing complex functions', () => {
  test('should do serialized function', () => {
    const formula = `return (stat["atkFinal"] * ${talent[skillIndex]} + stat["hpFinal"] * ${hp_multi}) * stat["dmg_multi"]`
    const func = new Function("stat", formula)
    const result = func(complexStat)
    expect(result).toBe(expectedVal)
  })
  test('should do obj parsing', () => {
    const formula = {
      dmg_multi: {
        atkFinal: talent[skillIndex],
        hpFinal: hp_multi,
      }
    }
    const result = objFormulaParser(formula, complexStat)
    expect(result).toBe(expectedVal)
  })
})