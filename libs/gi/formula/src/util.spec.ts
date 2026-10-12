import { allTravelerKeys } from '@genshin-optimizer/gi/consts'
import { isActive } from './data/common/conds'
import { genshinCalculatorWithEntries } from './index'
import {
  dynIsActiveEntry,
  pandoContextEntries,
  resolveActiveMember,
  teamData,
  travelerEleCondEntries,
  travelerEleCondName,
  travelerMemberSrcs,
  unlockedTravelerKeys,
} from './util'

describe('resolveActiveMember', () => {
  test('solo always uses that member', () => {
    expect(resolveActiveMember(['0'])).toBe('0')
    expect(resolveActiveMember(['2'], '0')).toBe('2')
    expect(resolveActiveMember(['1'], '3')).toBe('1')
  })

  test('team uses requested when present', () => {
    expect(resolveActiveMember(['0', '1', '2'], '1')).toBe('1')
    expect(resolveActiveMember(['0', '1'], '2')).toBe('0')
    expect(resolveActiveMember(['0', '1'])).toBe('0')
  })

  test('empty list falls back to 0', () => {
    expect(resolveActiveMember([])).toBe('0')
  })
})

describe('dynIsActiveEntry', () => {
  test('writes dyn isActive for src', () => {
    const entry = dynIsActiveEntry('2')
    expect(entry.tag).toMatchObject({
      sheet: 'dyn',
      src: '2',
      dst: null,
      q: 'isActive',
    })
    expect(entry.value).toMatchObject({ op: 'const', ex: 1 })
  })
})

describe('traveler ele conds', () => {
  test('names match WR tk.toLowerCase()', () => {
    expect(travelerEleCondName('TravelerAnemo')).toBe('traveleranemo')
    expect(travelerEleCondName('TravelerGeo')).toBe('travelergeo')
  })

  test('unlockedTravelerKeys filters with hasChar', () => {
    expect(
      unlockedTravelerKeys(
        (tk) => tk === 'TravelerAnemo' || tk === 'TravelerGeo'
      )
    ).toEqual(['TravelerAnemo', 'TravelerGeo'])
    expect(unlockedTravelerKeys(() => true)).toEqual([...allTravelerKeys])
  })

  test('travelerMemberSrcs keeps traveler slots', () => {
    expect(
      travelerMemberSrcs([
        { src: '0', charKey: 'TravelerGeo' },
        { src: '1', charKey: 'Nahida' },
        { src: '2', charKey: '' },
        { src: '3' },
      ])
    ).toEqual(['0'])
  })

  test('travelerEleCondEntries writes each src × unlocked key', () => {
    const entries = travelerEleCondEntries(['0', '1'], ['TravelerAnemo'])
    expect(entries).toHaveLength(2)
    expect(entries[0]!.tag).toMatchObject({
      sheet: 'Traveler',
      src: '0',
      dst: null,
      q: 'traveleranemo',
    })
    expect(entries[1]!.tag).toMatchObject({ src: '1', q: 'traveleranemo' })
  })
})

describe('pandoContextEntries', () => {
  test('injects isActive and traveler conds', () => {
    const entries = pandoContextEntries({
      memberKeys: ['0'],
      activeMember: '2',
      travelerSrcs: ['0'],
      unlockedTravelers: ['TravelerAnemo'],
    })
    expect(entries[0]!.tag).toMatchObject({
      sheet: 'dyn',
      src: '0',
      q: 'isActive',
    })
    expect(entries[1]!.tag).toMatchObject({
      sheet: 'Traveler',
      src: '0',
      q: 'traveleranemo',
    })
  })

  test('team without requested active does not inject isActive', () => {
    expect(pandoContextEntries({ memberKeys: ['0', '1'] })).toEqual([])
  })

  test('team keeps requested active member', () => {
    const [active] = pandoContextEntries({
      memberKeys: ['0', '1'],
      activeMember: '1',
    })
    expect(active!.tag.src).toBe('1')
  })

  test('solo calc treats the only member as on-field', () => {
    const calc = genshinCalculatorWithEntries([
      ...teamData(['2']),
      ...pandoContextEntries({ memberKeys: ['2'], activeMember: '0' }),
    ])
    expect(calc.withTag({ src: '2' }).compute(isActive.ifOn(1)).val).toBe(1)
  })
})
