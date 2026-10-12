import { sortEntriesBySrcTeamCharId } from './buildUtil'

describe('sortEntriesBySrcTeamCharId', () => {
  const entries: [string, { srcTeamCharId?: string }][] = [
    ['a', {}],
    ['b', { srcTeamCharId: 'loadout2' }],
    ['c', { srcTeamCharId: 'loadout1' }],
    ['d', {}],
  ]

  it('returns entries unchanged when srcTeamCharId is omitted', () => {
    expect(sortEntriesBySrcTeamCharId(entries)).toEqual(entries)
  })

  it('sorts matching srcTeamCharId entries first, preserving relative order', () => {
    expect(
      sortEntriesBySrcTeamCharId(entries, 'loadout1').map(([id]) => id)
    ).toEqual(['c', 'a', 'b', 'd'])
    expect(
      sortEntriesBySrcTeamCharId(entries, 'loadout2').map(([id]) => id)
    ).toEqual(['b', 'a', 'c', 'd'])
  })
})
