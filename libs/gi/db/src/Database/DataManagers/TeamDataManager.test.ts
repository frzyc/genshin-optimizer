import { DBLocalStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'
import { initCharTC } from './BuildTcDataManager'
import type { LoadoutDatum } from './TeamDataManager'

describe('export and import test', () => {
  const dbStorage = new DBLocalStorage(localStorage)
  const dbIndex = 1
  let database = new ArtCharDatabase(dbIndex, dbStorage)

  beforeEach(() => {
    dbStorage.clear()
    database = new ArtCharDatabase(dbIndex, dbStorage)
  })
  test('exim', () => {
    // Create a team [Raiden, null, bennett, null]

    const raidenId = database.teamChars.new('RaidenShogun', {
      optConfigId: database.optConfigs.new({
        optimizationTarget: ['test'],
      }),
    })
    database.builds.new({ characterKey: 'RaidenShogun' })
    database.buildTcs.new(initCharTC('RaidenShogun', 'EngulfingLightning'))
    expect(database.builds.forCharacter('RaidenShogun').length).toEqual(1)
    expect(database.buildTcs.forCharacter('RaidenShogun').length).toEqual(1)

    const bennettId = database.teamChars.new('Bennett')
    database.builds.new({ characterKey: 'Bennett' })
    database.buildTcs.new(initCharTC('Bennett', 'SapwoodBlade'))
    const teamId = database.teams.new({
      loadoutData: [
        { teamCharId: raidenId } as LoadoutDatum,
        undefined,
        { teamCharId: bennettId } as LoadoutDatum,
      ],
    })

    const dbTeam = database.teams.get(teamId)!
    expect(dbTeam).toBeTruthy()
    expect(dbTeam.loadoutData[0]?.teamCharId).toEqual(raidenId)
    expect(dbTeam.loadoutData[2]?.teamCharId).toEqual(bennettId)

    const exp = database.teams.export(teamId, [
      {
        convertbuilds: [],
        convertEquipped: true,
        convertTcBuilds: [],
        exportCustomMultiTarget: [],
      },
      {
        convertbuilds: [],
        convertEquipped: true,
        convertTcBuilds: [],
        exportCustomMultiTarget: [],
      },
      {
        convertbuilds: [],
        convertEquipped: true,
        convertTcBuilds: [],
        exportCustomMultiTarget: [],
      },
    ])
    expect(exp).toBeTruthy()
    expect((exp as any).loadoutData[0].key).toEqual('RaidenShogun')
    expect((exp as any).loadoutData[0].optConfig.optimizationTarget).toEqual([
      'test',
    ])

    let res: object | undefined
    expect(() => {
      const json = JSON.stringify(exp)
      res = JSON.parse(json)
    }).not.toThrow()
    expect(res).toBeTruthy()
    const importTeamId = database.teams.import(exp)
    const importTeam = database.teams.get(importTeamId)!
    expect(importTeam).toBeTruthy()

    const raidenTeamChar = database.teamChars.get(
      importTeam.loadoutData[0]?.teamCharId
    )
    expect(raidenTeamChar?.key).toEqual('RaidenShogun')
    expect(database.buildTcs.forCharacter('RaidenShogun').length).toEqual(2)
    expect(
      database.optConfigs.get(raidenTeamChar?.optConfigId)?.optimizationTarget
    ).toEqual(['test'])
    const bennettTeamChar = database.teamChars.get(
      importTeam.loadoutData[2]?.teamCharId
    )
    expect(bennettTeamChar?.key).toEqual('Bennett')
    expect(database.buildTcs.forCharacter('Bennett').length).toEqual(2)
  })

  test('deleting loadout does not delete builds', () => {
    const teamCharId = database.teamChars.new('HuTao')
    database.builds.new({ characterKey: 'HuTao' })
    database.buildTcs.new(initCharTC('HuTao', 'StaffOfHoma'))
    expect(database.builds.forCharacter('HuTao').length).toEqual(1)
    expect(database.buildTcs.forCharacter('HuTao').length).toEqual(1)

    database.teamChars.remove(teamCharId)

    expect(database.builds.forCharacter('HuTao').length).toEqual(1)
    expect(database.buildTcs.forCharacter('HuTao').length).toEqual(1)
  })

  test('entriesForCharacter sorts srcTeamCharId builds first', () => {
    const loadoutA = database.teamChars.new('Xiangling')
    const loadoutB = database.teamChars.new('Xiangling')
    const id1 = database.builds.new({ characterKey: 'Xiangling' })
    const id2 = database.builds.new({
      characterKey: 'Xiangling',
      srcTeamCharId: loadoutB,
    })
    const id3 = database.builds.new({
      characterKey: 'Xiangling',
      srcTeamCharId: loadoutA,
    })

    expect(
      database.builds
        .entriesForCharacter('Xiangling', loadoutA)
        .map(([id]) => id)
    ).toEqual([id3, id1, id2])

    const tcId1 = database.buildTcs.new(initCharTC('Xiangling', 'StaffOfHoma'))
    const tcId2 = database.buildTcs.new({
      ...initCharTC('Xiangling', 'StaffOfHoma'),
      srcTeamCharId: loadoutB,
    })
    const tcId3 = database.buildTcs.new({
      ...initCharTC('Xiangling', 'StaffOfHoma'),
      srcTeamCharId: loadoutA,
    })
    expect(
      database.buildTcs
        .entriesForCharacter('Xiangling', loadoutA)
        .map(([id]) => id)
    ).toEqual([tcId3, tcId1, tcId2])
  })

  test('two loadouts for same character can reference same build', () => {
    const loadoutA = database.teamChars.new('Xiangling')
    const loadoutB = database.teamChars.new('Xiangling')
    database.builds.new({ characterKey: 'Xiangling' })
    const buildId = database.builds.keys[0]!

    const teamId = database.teams.new({
      loadoutData: [
        {
          teamCharId: loadoutA,
          buildType: 'real',
          buildId,
        } as LoadoutDatum,
        {
          teamCharId: loadoutB,
          buildType: 'real',
          buildId,
        } as LoadoutDatum,
      ],
    })

    const team = database.teams.get(teamId)!
    expect(team.loadoutData[0]?.buildId).toEqual(buildId)
    expect(team.loadoutData[1]?.buildId).toEqual(buildId)
  })
})
