import { DBLocalStorage } from '@genshin-optimizer/common/database'
import { SroDatabase } from '../Database'
import { initCharTC } from './BuildTcDataManager'
import type { LoadoutMetadatum } from './TeamDataManager'

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

    const tingyunId = database.loadouts.new('Tingyun', {
      buildIds: [database.builds.new()],
      buildTcIds: [database.buildTcs.new(initCharTC())],
      optConfigId: database.optConfigs.new({ optimizationTarget: ['test'] }),
    })
    expect(database.loadouts.get(tingyunId)?.buildIds.length).toEqual(1)
    expect(database.loadouts.get(tingyunId)?.buildTcIds.length).toEqual(1)
    const march7thId = database.loadouts.new('March7th', {
      buildIds: [database.builds.new()],
      buildTcIds: [database.buildTcs.new(initCharTC())],
    })
    const teamId = database.teams.new({
      loadoutMetadata: [
        { loadoutId: tingyunId } as LoadoutMetadatum,
        undefined,
        { loadoutId: march7thId } as LoadoutMetadatum,
      ],
    })

    const dbTeam = database.teams.get(teamId)!
    expect(dbTeam).toBeTruthy()
    expect(dbTeam.loadoutMetadata[0]?.loadoutId).toEqual(tingyunId)
    expect(dbTeam.loadoutMetadata[2]?.loadoutId).toEqual(march7thId)

    const exp = database.teams.export(teamId)
    expect(exp).toBeTruthy()
    expect((exp as any).loadoutMetadata[0].key).toEqual('Tingyun')
    expect(
      (exp as any).loadoutMetadata[0].optConfig.optimizationTarget
    ).toEqual(['test'])

    let res: object | undefined = undefined
    expect(() => {
      const json = JSON.stringify(exp)
      res = JSON.parse(json)
    }).not.toThrow()
    expect(res).toBeTruthy()
    const importTeamId = database.teams.import(exp)
    const importTeam = database.teams.get(importTeamId)!
    expect(importTeam).toBeTruthy()

    const tingyunTeamChar = database.loadouts.get(
      importTeam.loadoutMetadata[0]?.loadoutId
    )
    expect(tingyunTeamChar?.key).toEqual('Tingyun')
    expect(tingyunTeamChar?.buildIds.length).toEqual(0)
    expect(tingyunTeamChar?.buildTcIds.length).toEqual(1)
    expect(
      database.optConfigs.get(tingyunTeamChar?.optConfigId)?.optimizationTarget
    ).toEqual(['test'])
    const march7thTeamChar = database.loadouts.get(
      importTeam.loadoutMetadata[2]?.loadoutId
    )
    expect(march7thTeamChar?.key).toEqual('March7th')
    expect(march7thTeamChar?.buildIds.length).toEqual(0)
    expect(march7thTeamChar?.buildTcIds.length).toEqual(1)
  })
})
