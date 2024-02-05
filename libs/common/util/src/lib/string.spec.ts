import { hammingDistance, levenshteinDistance } from './string'
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
})
