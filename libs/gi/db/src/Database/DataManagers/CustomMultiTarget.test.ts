import { validateCustomMultiTarget } from './CustomMultiTarget'

describe('CustomMultiTarget', () => {
  it('should validate complete CustomMultiTarget', () => {
    const valid = {
      name: 'Test Target',
      description: 'Test description',
      targets: [],
    }
    const result = validateCustomMultiTarget(valid)
    expect(result?.name).toBe('Test Target')
  })

  it('should reject invalid targets (not an array)', () => {
    const invalid = {
      name: 'Test',
      description: 'Test',
      targets: 'not an array',
    }
    expect(validateCustomMultiTarget(invalid)).toBeUndefined()
  })
})
