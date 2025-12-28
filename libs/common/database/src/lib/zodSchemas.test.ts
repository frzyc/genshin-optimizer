import {
  zodBoolean,
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
  zodEnumWithDefault,
  zodFilteredArray,
  zodNumericLiteral,
  zodString,
} from './zodSchemas'

describe('zodSchemas utilities', () => {
  describe('zodEnum', () => {
    const schema = zodEnum(['a', 'b', 'c'] as const)

    it('should accept valid enum values', () => {
      expect(schema.parse('a')).toBe('a')
      expect(schema.parse('b')).toBe('b')
      expect(schema.parse('c')).toBe('c')
    })

    it('should reject invalid values', () => {
      expect(() => schema.parse('invalid')).toThrow()
      expect(() => schema.parse(123)).toThrow()
    })
  })

  describe('zodEnumWithDefault', () => {
    const schema = zodEnumWithDefault(['a', 'b', 'c'] as const, 'a')

    it('should accept valid enum values', () => {
      expect(schema.parse('b')).toBe('b')
      expect(schema.parse('c')).toBe('c')
    })

    it('should return default for invalid values', () => {
      expect(schema.parse('invalid')).toBe('a')
      expect(schema.parse(123)).toBe('a')
      expect(schema.parse(null)).toBe('a')
    })
  })

  describe('zodBoundedNumber', () => {
    const schema = zodBoundedNumber(0, 100, 50)

    it('should accept numbers within bounds', () => {
      expect(schema.parse(0)).toBe(0)
      expect(schema.parse(50)).toBe(50)
      expect(schema.parse(100)).toBe(100)
    })

    it('should return fallback for out-of-bounds values', () => {
      expect(schema.parse(-1)).toBe(50)
      expect(schema.parse(101)).toBe(50)
    })

    it('should return fallback for non-numbers', () => {
      expect(schema.parse('string')).toBe(50)
      expect(schema.parse(null)).toBe(50)
      expect(schema.parse(undefined)).toBe(50)
      expect(schema.parse(NaN)).toBe(50)
      expect(schema.parse(Infinity)).toBe(50)
    })
  })

  describe('zodClampedNumber', () => {
    const schema = zodClampedNumber(0, 100, 50)

    it('should accept numbers within bounds', () => {
      expect(schema.parse(0)).toBe(0)
      expect(schema.parse(50)).toBe(50)
      expect(schema.parse(100)).toBe(100)
    })

    it('should clamp out-of-bounds values', () => {
      expect(schema.parse(-10)).toBe(0)
      expect(schema.parse(150)).toBe(100)
    })

    it('should return fallback for non-numbers', () => {
      expect(schema.parse('string')).toBe(50)
      expect(schema.parse(null)).toBe(50)
      expect(schema.parse(undefined)).toBe(50)
    })
  })

  describe('zodBoolean', () => {
    describe('default mode (no coercion)', () => {
      const schema = zodBoolean()

      it('should accept boolean values', () => {
        expect(schema.parse(true)).toBe(true)
        expect(schema.parse(false)).toBe(false)
      })

      it('should return false for non-boolean values', () => {
        expect(schema.parse(1)).toBe(false)
        expect(schema.parse('true')).toBe(false)
        expect(schema.parse(null)).toBe(false)
      })
    })

    describe('coerce mode', () => {
      const schema = zodBoolean({ coerce: true })

      it('should coerce truthy/falsy values', () => {
        expect(schema.parse(1)).toBe(true)
        expect(schema.parse(0)).toBe(false)
        expect(schema.parse('string')).toBe(true)
        expect(schema.parse('')).toBe(false)
        expect(schema.parse(null)).toBe(false)
      })
    })

    describe('custom default', () => {
      const schema = zodBoolean({ defaultValue: true })

      it('should use custom default for non-boolean', () => {
        expect(schema.parse('string')).toBe(true)
        expect(schema.parse(null)).toBe(true)
      })
    })

    describe('legacy API', () => {
      const schema = zodBoolean(true) // coerce mode via boolean arg

      it('should support legacy boolean argument for coerce mode', () => {
        expect(schema.parse(1)).toBe(true)
        expect(schema.parse(0)).toBe(false)
      })
    })
  })

  describe('zodFilteredArray', () => {
    const validKeys = ['a', 'b', 'c'] as const

    describe('with default = all keys', () => {
      const schema = zodFilteredArray(validKeys)

      it('should accept arrays with valid values', () => {
        expect(schema.parse(['a', 'b'])).toEqual(['a', 'b'])
      })

      it('should filter out invalid values', () => {
        expect(schema.parse(['a', 'invalid', 'b'])).toEqual(['a', 'b'])
      })

      it('should preserve empty arrays', () => {
        expect(schema.parse([])).toEqual([])
      })

      it('should return default for non-array input', () => {
        expect(schema.parse('not-array')).toEqual(['a', 'b', 'c'])
        expect(schema.parse(null)).toEqual(['a', 'b', 'c'])
      })
    })

    describe('with custom default', () => {
      const schema = zodFilteredArray(validKeys, [])

      it('should return custom default for non-array input', () => {
        expect(schema.parse('not-array')).toEqual([])
        expect(schema.parse(null)).toEqual([])
      })
    })
  })

  describe('zodNumericLiteral', () => {
    const schema = zodNumericLiteral([1, 2, 3, 4, 5] as const)

    it('should accept valid numeric values', () => {
      expect(schema.parse(1)).toBe(1)
      expect(schema.parse(3)).toBe(3)
      expect(schema.parse(5)).toBe(5)
    })

    it('should reject invalid numeric values', () => {
      expect(() => schema.parse(0)).toThrow()
      expect(() => schema.parse(6)).toThrow()
      expect(() => schema.parse(1.5)).toThrow()
    })

    it('should reject non-numbers', () => {
      expect(() => schema.parse('1')).toThrow()
    })
  })

  describe('zodString', () => {
    describe('with default fallback', () => {
      const schema = zodString()

      it('should accept string values', () => {
        expect(schema.parse('hello')).toBe('hello')
        expect(schema.parse('')).toBe('')
      })

      it('should return empty string for non-string values', () => {
        expect(schema.parse(123)).toBe('')
        expect(schema.parse(null)).toBe('')
        expect(schema.parse(undefined)).toBe('')
      })
    })

    describe('with custom fallback', () => {
      const schema = zodString('default')

      it('should return custom fallback for non-string', () => {
        expect(schema.parse(123)).toBe('default')
        expect(schema.parse(null)).toBe('default')
      })
    })
  })
})
