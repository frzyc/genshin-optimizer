import { validateTalent } from '@genshin-optimizer/gi/schema'

describe('Test character talent validation', () => {
  test('Should return default talents for invalid input', () => {
    const invalidInputs: any[] = ['invalidTalent', undefined, null, 4]
    for (const invalidInput of invalidInputs) {
      const result = validateTalent(1, invalidInput)
      expect(result).toEqual({ auto: 1, skill: 1, burst: 1 })
    }
  })
  test('Should clamp talent levels correctly while importing', () => {
    const invalidTalent = {
      auto: 3,
      skill: 10,
      burst: 0,
    }
    const result = validateTalent(3, invalidTalent)
    expect(result.auto).toEqual(3)
    expect(result.skill).toEqual(4)
    expect(result.burst).toEqual(1)
  })
})
