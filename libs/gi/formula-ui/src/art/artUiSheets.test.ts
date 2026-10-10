import { describe, expect, it } from 'vitest'
import { artUiSheets } from './artUiSheets'

function condNames(setKey: keyof typeof artUiSheets, piece: '1' | '2' | '4') {
  return (
    artUiSheets[setKey][piece]?.documents.flatMap((d) =>
      d.type === 'conditional' ? [d.conditional.metadata.name] : []
    ) ?? []
  )
}

describe('artUiSheets', () => {
  it('attaches Noblesse 4pc set4 conditional', () => {
    expect(condNames('NoblesseOblige', '4')).toContain('set4')
    expect(
      artUiSheets.NoblesseOblige[2]?.documents.some((d) => d.type === 'text')
    ).toBe(true)
  })

  it('puts Viridescent swirl conds on 4pc', () => {
    expect(condNames('ViridescentVenerer', '4')).toEqual(
      expect.arrayContaining([
        'swirlcryo',
        'swirlelectro',
        'swirlhydro',
        'swirlpyro',
      ])
    )
  })

  it('omits 2/4 sections for 1pc prayer sets', () => {
    expect(artUiSheets.PrayersForWisdom[2]).toBeUndefined()
    expect(artUiSheets.PrayersForWisdom[4]).toBeUndefined()
    expect(artUiSheets.PrayersForWisdom[1]).toBeDefined()
  })

  it('uses a value badge for list and num conditionals', () => {
    const listCond = artUiSheets.ArchaicPetra[4]?.documents.find(
      (d) => d.type === 'conditional'
    )
    expect(listCond?.type).toBe('conditional')
    if (listCond?.type === 'conditional') {
      expect(typeof listCond.conditional.badge).toBe('function')
      expect(typeof listCond.conditional.label).not.toBe('string')
    }
    const numCond = artUiSheets.CrimsonWitchOfFlames[4]?.documents.find(
      (d) => d.type === 'conditional'
    )
    expect(numCond?.type).toBe('conditional')
    if (numCond?.type === 'conditional')
      expect(typeof numCond.conditional.badge).toBe('function')
  })
})
