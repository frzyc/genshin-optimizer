import { z } from 'zod'
import {
  zodArray,
  zodBoolean,
  zodBooleanRecord,
  zodBoundedNumber,
  zodClampedNumber,
  zodEnumWithDefault,
  zodFilteredArray,
  zodNumberRecord,
  zodNumericLiteralWithDefault,
  zodString,
  zodTypedRecord,
  zodTypedRecordWith,
} from './zodSchemas'

describe('zodSchemas utilities', () => {
  describe('zodEnumWithDefault', () => {
    const schema = zodEnumWithDefault(['a', 'b', 'c'] as const, 'a')

    it('should return default for invalid values', () => {
      expect(schema.parse('invalid')).toBe('a')
      expect(schema.parse(123)).toBe('a')
      expect(schema.parse(null)).toBe('a')
    })
  })

  describe('zodBoundedNumber', () => {
    const schema = zodBoundedNumber(0, 100, 50)

    it('should return fallback for out-of-bounds values', () => {
      expect(schema.parse(-1)).toBe(50)
      expect(schema.parse(101)).toBe(50)
    })

    it('should return fallback for non-finite values', () => {
      expect(schema.parse('string')).toBe(50)
      expect(schema.parse(NaN)).toBe(50)
      expect(schema.parse(Infinity)).toBe(50)
    })
  })

  describe('zodClampedNumber', () => {
    const schema = zodClampedNumber(0, 100, 50)

    it('should clamp out-of-bounds values to min/max', () => {
      expect(schema.parse(-10)).toBe(0)
      expect(schema.parse(150)).toBe(100)
    })

    it('should return fallback for non-finite values', () => {
      expect(schema.parse('string')).toBe(50)
      expect(schema.parse(NaN)).toBe(50)
    })
  })

  describe('zodBoolean', () => {
    it('should return default for non-boolean', () => {
      expect(zodBoolean().parse(1)).toBe(false)
      expect(zodBoolean().parse('true')).toBe(false)
      expect(zodBoolean(true).parse('string')).toBe(true)
    })
  })

  describe('zodFilteredArray', () => {
    const validKeys = ['a', 'b', 'c'] as const

    it('should filter out invalid values from array', () => {
      const schema = zodFilteredArray(validKeys)
      expect(schema.parse(['a', 'invalid', 'b'])).toEqual(['a', 'b'])
    })

    it('should return default for non-array input', () => {
      expect(zodFilteredArray(validKeys).parse(null)).toEqual(['a', 'b', 'c'])
      expect(zodFilteredArray(validKeys, []).parse(null)).toEqual([])
    })
  })

  describe('zodNumericLiteralWithDefault', () => {
    const schema = zodNumericLiteralWithDefault([1, 2, 3, 4, 5] as const, 3)

    it('should return default for values not in allowed list', () => {
      expect(schema.parse(0)).toBe(3)
      expect(schema.parse(6)).toBe(3)
      expect(schema.parse('1')).toBe(3)
    })
  })

  describe('zodString', () => {
    it('should return fallback for non-string values', () => {
      expect(zodString().parse(123)).toBe('')
      expect(zodString('default').parse(null)).toBe('default')
    })
  })

  describe('zodBooleanRecord', () => {
    const keys = ['ability1', 'ability2', 'ability3'] as const
    const schema = zodBooleanRecord(keys)

    it('should only include keys from allowed list with boolean values', () => {
      expect(
        schema.parse({ ability1: true, invalidKey: true, ability2: 'string' })
      ).toEqual({ ability1: true })
    })

    it('should return empty object for non-object input', () => {
      expect(schema.parse(null)).toEqual({})
      expect(schema.parse('string')).toEqual({})
      expect(schema.parse([])).toEqual({})
    })
  })

  describe('zodArray', () => {
    const itemSchema = z.object({ id: z.number() })

    it('should return fallback for non-array input', () => {
      expect(zodArray(itemSchema).parse(null)).toEqual([])
      expect(zodArray(itemSchema, [{ id: 0 }]).parse('string')).toEqual([
        { id: 0 },
      ])
    })
  })

  describe('zodNumberRecord', () => {
    const keys = ['stat1', 'stat2', 'stat3'] as const
    const schema = zodNumberRecord(keys, 0)

    it('should create record with all keys and default value for missing/invalid', () => {
      expect(schema.parse({})).toEqual({ stat1: 0, stat2: 0, stat3: 0 })
      expect(schema.parse({ stat1: 10, stat2: 'invalid' })).toEqual({
        stat1: 10,
        stat2: 0,
        stat3: 0,
      })
    })

    it('should return record with defaults for non-object input', () => {
      expect(schema.parse(null)).toEqual({ stat1: 0, stat2: 0, stat3: 0 })
      expect(schema.parse('string')).toEqual({ stat1: 0, stat2: 0, stat3: 0 })
    })
  })

  describe('zodTypedRecord', () => {
    const keys = ['flower', 'plume', 'sands'] as const
    const schema = zodTypedRecord(keys, z.string().optional())

    it('should create object schema with all specified keys', () => {
      const result = schema.parse({ flower: 'a', plume: 'b', sands: 'c' })
      expect(result).toEqual({ flower: 'a', plume: 'b', sands: 'c' })
    })

    it('should apply value schema to each key', () => {
      const result = schema.parse({ flower: 'a' })
      expect(result).toEqual({
        flower: 'a',
        plume: undefined,
        sands: undefined,
      })
    })

    it('should infer correct type', () => {
      type Result = z.infer<typeof schema>
      const typeCheck: Result = { flower: 'a', plume: undefined, sands: 'c' }
      expect(typeCheck.flower).toBe('a')
    })
  })

  describe('zodTypedRecordWith', () => {
    const keys = ['flower', 'plume', 'sands'] as const
    const schema = zodTypedRecordWith(keys, (key) =>
      z.number().catch(key === 'flower' ? 100 : 0)
    )

    it('should apply per-key schema factory', () => {
      const result = schema.parse({})
      expect(result).toEqual({ flower: 100, plume: 0, sands: 0 })
    })

    it('should use factory defaults only for invalid values', () => {
      const result = schema.parse({ flower: 50, plume: 'invalid', sands: 25 })
      expect(result).toEqual({ flower: 50, plume: 0, sands: 25 })
    })

    it('should infer correct type', () => {
      type Result = z.infer<typeof schema>
      const typeCheck: Result = { flower: 1, plume: 2, sands: 3 }
      expect(typeCheck.flower).toBe(1)
    })
  })
})
