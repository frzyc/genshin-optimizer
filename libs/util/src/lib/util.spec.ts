import { crawlObject, layeredAssignment } from './util'

test('crawlObject', () => {
  const obj = { a: { b: { c: 'Test', c1: false }, b1: null }, a1: {} }
  crawlObject(
    obj,
    [],
    (t) => t === 'Test',
    (o, keys) => {
      expect(o).toBe('Test')
      expect(keys).toEqual(['a', 'b', 'c'])
    }
  )
})

test('layeredAssignment', () => {
  const obj = {}
  const keys = ['a', 'b', 'c', 'd']
  const expected = { a: { b: { c: { d: 'test' } } } }
  expect(layeredAssignment(obj, keys, 'test')).toEqual(expected)
})
