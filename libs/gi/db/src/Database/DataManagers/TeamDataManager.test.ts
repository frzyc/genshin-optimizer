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
      buildIds: [database.builds.new()],
      buildTcIds: [database.buildTcs.new(initCharTC('EngulfingLightning'))],
      optConfigId: database.optConfigs.new({
        optimizationTarget: ['test'],
      }),
    })
    expect(database.teamChars.get(raidenId)?.buildIds.length).toEqual(1)
    expect(database.teamChars.get(raidenId)?.buildTcIds.length).toEqual(1)
    const bennettId = database.teamChars.new('Bennett', {
      buildIds: [database.builds.new()],
      buildTcIds: [database.buildTcs.new(initCharTC('SapwoodBlade'))],
    })
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

    let res: object | undefined = undefined
    expect(() => {
      const json = JSON.stringify(exp)
      res = JSON.parse(json)
    }).not.toThrow()
    expect(res).toBeTruthy()
    const importTeamId = database.teams.import(exp)
    const importTeam = database.teams.get(importTeamId)!
    expect(importTeam).toBeTruthy()

    const raidenTeamChar = database.teamChars.get(
      importTeam.loadoutData[0]?.teamCharId,
    )
    expect(raidenTeamChar?.key).toEqual('RaidenShogun')
    expect(raidenTeamChar?.buildIds.length).toEqual(0)
    expect(raidenTeamChar?.buildTcIds.length).toEqual(1)
    expect(
      database.optConfigs.get(raidenTeamChar?.optConfigId)?.optimizationTarget,
    ).toEqual(['test'])
    const bennettTeamChar = database.teamChars.get(
      importTeam.loadoutData[2]?.teamCharId,
    )
    expect(bennettTeamChar?.key).toEqual('Bennett')
    expect(bennettTeamChar?.buildIds.length).toEqual(0)
    expect(bennettTeamChar?.buildTcIds.length).toEqual(1)
  })
})
