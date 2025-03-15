import { extractJSON, hammingDistance, levenshteinDistance } from './string'
describe('test  @genshin_optimizer/util/string', () => {
  it('test hammingDistance', () => {
    expect(hammingDistance('Pyro DMG Bonus', 'Cryo DMG Bonus')).toEqual(1)
    expect(hammingDistance('Pyro DMG Bonus', 'Dendro DMG Bonus')).toEqual(16)
  })

  it('test levenshteinDistance', () => {
    expect(levenshteinDistance('Pyro DMG Bonus', 'Cryo DMG Bonus')).toEqual(3)
    expect(levenshteinDistance('Pyro DMG Bonus', 'Dendro DMG Bonus')).toEqual(4)
    expect(levenshteinDistance('Dendro DMG Bonus', 'endro DMG Bonu')).toEqual(2)
  })

  it('test extractJSON', () => {
    expect(extractJSON('Leading text {"key": "value"} trailing text')).toEqual({
      key: 'value',
    })
    expect(extractJSON('{"escaped": "He said \\"hello\\"."}')).toEqual({
      escaped: 'He said "hello".',
    })
    expect(extractJSON('{"nested": {"key": "value", "list": [1, 2]}}')).toEqual(
      { nested: { key: 'value', list: [1, 2] } },
    )
    expect(extractJSON('{"bool": true, "nullValue": null}')).toEqual({
      bool: true,
      nullValue: null,
    })
    expect(extractJSON('{key: "value"}')).toEqual(null)
    expect(extractJSON('{"a": "b"} {"c": "d"}')).toEqual({ a: 'b' })
    expect(extractJSON('')).toEqual(null)
  })
})
