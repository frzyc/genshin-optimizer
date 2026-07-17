import { SandboxStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from './ArtCharDatabase'
import { initCharTC } from './DataManagers/BuildTcDataManager'
import { migrate } from './migrate'

describe('migrate v26 global builds', () => {
  test('backfills characterKey from teamchar buildIds and strips loadout lists', () => {
    const storage = new SandboxStorage({})
    storage.setDBVersion(25)

    const buildId = 'build_0'
    const buildTcId = 'buildTc_0'
    const teamCharId = 'teamchar_0'

    storage.set(buildId, {
      name: 'Test Build',
      description: '',
      id: buildId,
      weaponId: undefined,
      artifactIds: {},
    })
    const { characterKey: _characterKey, ...legacyBuildTc } = initCharTC(
      'RaidenShogun',
      'EngulfingLightning'
    )
    storage.set(buildTcId, {
      ...legacyBuildTc,
      name: 'Test TC',
    })
    storage.set(teamCharId, {
      key: 'RaidenShogun',
      name: 'Raiden Loadout',
      description: '',
      customMultiTargets: [],
      conditional: {},
      bonusStats: {},
      hitMode: 'avgHit',
      buildIds: [buildId],
      buildTcIds: [buildTcId],
      optConfigId: 'optConfig_0',
    })
    storage.set('optConfig_0', {})

    migrate(storage)

    expect(storage.getDBVersion()).toEqual(26)
    expect(storage.get(teamCharId).buildIds).toBeUndefined()
    expect(storage.get(teamCharId).buildTcIds).toBeUndefined()
    expect(storage.get(buildId).characterKey).toEqual('RaidenShogun')
    expect(storage.get(buildTcId).characterKey).toEqual('RaidenShogun')
    expect(storage.get(buildId)).toBeTruthy()
    expect(storage.get(buildTcId)).toBeTruthy()
  })

  test('removes builds that cannot be assigned a characterKey', () => {
    const storage = new SandboxStorage({})
    storage.setDBVersion(25)

    storage.set('build_0', {
      name: 'Orphan Build',
      description: '',
      id: 'build_0',
      artifactIds: {},
    })

    migrate(storage)

    expect(storage.get('build_0')).toBeUndefined()
  })

  test('rejects builds without characterKey on load', () => {
    const storage = new SandboxStorage({})
    storage.setDBVersion(26)
    storage.set('build_0', {
      name: 'Invalid Build',
      description: '',
      id: 'build_0',
      artifactIds: {},
    })

    const database = new ArtCharDatabase(1, storage)
    expect(database.builds.get('build_0')).toBeUndefined()
    expect(database.builds.keys.includes('build_0')).toBeFalsy()
  })
})
