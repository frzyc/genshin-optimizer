import { validateCustomMultiTarget } from './CustomMultiTarget'

describe('CustomMultiTarget.validate', () => {
  it('should validate valid CustomMultiTarget', () => {
    const valid = {
      name: 'Test Target',
      description: 'Test description',
      targets: [],
    }
    const result = validateCustomMultiTarget(valid)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Test Target')
  })

  it('should return undefined for non-object types', () => {
    expect(validateCustomMultiTarget(null)).toBeUndefined()
  })

  it('should return undefined if targets is not an array', () => {
    const invalid = {
      name: 'Test',
      description: 'Test',
      targets: 'not an array',
    }
    const result = validateCustomMultiTarget(invalid)
    expect(result).toBeUndefined()
  })
})
