import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { describe, expect, it } from 'vitest'
import { ArtCharDatabase } from '../ArtCharDatabase'
import { pandoTeamSrcKeys } from './PandoTeamDataManager'

describe('PandoTeamDataManager teammates', () => {
  it('stores unique teammate slots and drops that member’s conditionals on clear', () => {
    const database = new ArtCharDatabase(1, createTestDBStorage('go'))
    database.pandoTeams.getOrCreate('Noelle')
    database.pandoTeams.setTeammate('Noelle', 0, 'Nahida')
    database.pandoTeams.setConditional(
      'Noelle',
      'Nahida',
      'partyInBurst',
      '1',
      null,
      1
    )
    expect(database.pandoTeams.get('Noelle')?.teammates).toEqual([
      'Nahida',
      '',
      '',
    ])
    expect(
      pandoTeamSrcKeys(database.pandoTeams.get('Noelle')!.teammates)
    ).toEqual(['0', '1'])

    database.pandoTeams.setTeammate('Noelle', 1, 'Nahida')
    expect(database.pandoTeams.get('Noelle')?.teammates).toEqual([
      '',
      'Nahida',
      '',
    ])
    expect(database.pandoTeams.get('Noelle')?.conditionals).toEqual([])

    database.pandoTeams.setTeammate('Noelle', 1, '')
    const team = database.pandoTeams.get('Noelle')
    expect(team?.teammates).toEqual(['', '', ''])
    expect(team?.conditionals).toEqual([])
    expect(team?.activeMember).toBe('0')
  })

  it('defaults on-field to the main character and resets when that teammate is cleared', () => {
    const database = new ArtCharDatabase(1, createTestDBStorage('go'))
    expect(database.pandoTeams.getOrCreate('Noelle').activeMember).toBe('0')
    database.pandoTeams.setTeammate('Noelle', 0, 'Nahida')
    database.pandoTeams.setActiveMember('Noelle', '1')
    expect(database.pandoTeams.get('Noelle')?.activeMember).toBe('1')
    database.pandoTeams.setActiveMember('Noelle', '2')
    expect(database.pandoTeams.get('Noelle')?.activeMember).toBe('0')
    database.pandoTeams.setActiveMember('Noelle', '1')
    database.pandoTeams.setTeammate('Noelle', 0, '')
    expect(database.pandoTeams.get('Noelle')?.activeMember).toBe('0')
  })

  it('creates an optConfig so Optimize and Builds share one provider', () => {
    const database = new ArtCharDatabase(1, createTestDBStorage('go'))
    const team = database.pandoTeams.getOrCreate('Noelle')
    expect(team.optConfigId).toBeTruthy()
    expect(database.pandoOptConfigs.get(team.optConfigId!)).toBeDefined()
    expect(database.pandoTeams.getOrCreate('Noelle').optConfigId).toBe(
      team.optConfigId
    )
  })

  it('rejects the main character as a teammate', () => {
    const database = new ArtCharDatabase(1, createTestDBStorage('go'))
    database.pandoTeams.setTeammate('Noelle', 0, 'Noelle')
    expect(database.pandoTeams.get('Noelle')?.teammates[0]).toBe('')
  })
})
