import { createTestDBStorage } from '@genshin-optimizer/common-database'
import { currentDBVersion, zzzSource } from '../Interfaces'
import { ZzzDatabase } from './Database'

const testDatabaseJson = {
  format: 'ZOD',
  dbVersion: currentDBVersion,
  source: zzzSource,
  version: 1,
  characters: [{ key: 'Anby', level: 1, ascension: 0, core: 0, skill: {} }],
  discs: [],
  wengines: [],
  charMetas: [],
  generatedBuildList: [],
  optConfigs: [],
  teams: [
    {
      id: 'Anby',
      teammates: [{ characterKey: 'Anby' }],
      frames: [
        {
          tag: { q: 'atk', qt: 'final' },
          multiplier: 1,
          critMode: 'avg',
          bonusStats: [],
          conditionals: [],
          enemyStats: [],
        },
      ],
      enemyLvl: 80,
      enemyDef: 953,
      enemyStunMultiplier: 150,
    },
  ],
}

function normalizeForComparison(data: Record<string, unknown>) {
  const clone = structuredClone(data)
  if (clone.dbMeta && typeof clone.dbMeta === 'object') {
    delete (clone.dbMeta as Record<string, unknown>).lastEdit
  }
  if (Array.isArray(clone.generatedBuildList)) {
    for (const build of clone.generatedBuildList) {
      if (build && typeof build === 'object') {
        delete (build as Record<string, unknown>).buildDate
      }
    }
  }
  return clone
}

describe('Database import/export round trip', () => {
  it('should produce identical JSON across import/export cycles', () => {
    const dbStorage1 = createTestDBStorage('zzz')
    const database1 = new ZzzDatabase(1, dbStorage1)

    const input = structuredClone(testDatabaseJson)
    database1.importZOOD(input, false, false)
    const firstExport = database1.exportZOOD()

    const dbStorage2 = createTestDBStorage('zzz')
    const database2 = new ZzzDatabase(1, dbStorage2)

    database2.importZOOD(firstExport, false, false)
    const secondExport = database2.exportZOOD()

    const firstJson = JSON.stringify(normalizeForComparison(firstExport))
    const secondJson = JSON.stringify(normalizeForComparison(secondExport))

    expect(secondJson).toBe(firstJson)
  })
})
