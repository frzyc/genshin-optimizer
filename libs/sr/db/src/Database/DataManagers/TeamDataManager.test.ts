import { DBLocalStorage } from '@genshin-optimizer/common/database'
import { SroDatabase } from '../Database'
import { initCharTC } from './BuildTcDataManager'
import type { LoadoutDatum } from './TeamDataManager'

describe('export and import test', () => {
  const dbStorage = new DBLocalStorage(localStorage)
  const dbIndex = 1
  let database = new SroDatabase(dbIndex, dbStorage)

  beforeEach(() => {
    dbStorage.clear()
    database = new SroDatabase(dbIndex, dbStorage)
  })
  test('exim', () => {
    // Create a team [Tingyun, null, March7th, null]

    const tingyunId = database.teamChars.new('Tingyun', {
      buildIds: [database.builds.new()],
      buildTcIds: [database.buildTcs.new(initCharTC())],
      optConfigId: database.optConfigs.new({ optimizationTarget: ['test'] }),
    })
    expect(database.teamChars.get(tingyunId)?.buildIds.length).toEqual(1)
    expect(database.teamChars.get(tingyunId)?.buildTcIds.length).toEqual(1)
    const march7thId = database.teamChars.new('March7th', {
      buildIds: [database.builds.new()],
      buildTcIds: [database.buildTcs.new(initCharTC())],
    })
    const teamId = database.teams.new({
      loadoutData: [
        { teamCharId: tingyunId } as LoadoutDatum,
        undefined,
        { teamCharId: march7thId } as LoadoutDatum,
      ],
    })

    const dbTeam = database.teams.get(teamId)!
    expect(dbTeam).toBeTruthy()
    expect(dbTeam.loadoutData[0]?.teamCharId).toEqual(tingyunId)
    expect(dbTeam.loadoutData[2]?.teamCharId).toEqual(march7thId)

    const exp = database.teams.export(teamId)
    expect(exp).toBeTruthy()
    expect((exp as any).loadoutData[0].key).toEqual('Tingyun')
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

    const tingyunTeamChar = database.teamChars.get(
      importTeam.loadoutData[0]?.teamCharId
    )
    expect(tingyunTeamChar?.key).toEqual('Tingyun')
    expect(tingyunTeamChar?.buildIds.length).toEqual(0)
    expect(tingyunTeamChar?.buildTcIds.length).toEqual(1)
    expect(
      database.optConfigs.get(tingyunTeamChar?.optConfigId)?.optimizationTarget
    ).toEqual(['test'])
    const march7thTeamChar = database.teamChars.get(
      importTeam.loadoutData[2]?.teamCharId
    )
    expect(march7thTeamChar?.key).toEqual('March7th')
    expect(march7thTeamChar?.buildIds.length).toEqual(0)
    expect(march7thTeamChar?.buildTcIds.length).toEqual(1)
  })
})
