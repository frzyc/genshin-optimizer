import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ZzzDatabase } from './Database'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testDatabaseJson = require('./Van_2025-07-16_20-54-24.json')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeForComparison(data: any) {
  const clone = structuredClone(data)
  // Remove time-based fields that change between imports
  if (clone.dbMeta) {
    delete clone.dbMeta.lastEdit
  }
  if (Array.isArray(clone.generatedBuildList)) {
    for (const build of clone.generatedBuildList) {
      delete build.buildDate
    }
  }
  return clone
}

describe('Database import/export round trip', () => {
  it('should produce identical JSON across import/export cycles', () => {
    // First cycle: import raw JSON, export normalized data
    const dbStorage1 = createTestDBStorage('zzz')
    const database1 = new ZzzDatabase(1, dbStorage1)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input = structuredClone(testDatabaseJson) as any
    database1.importZOOD(input, false, false)
    const firstExport = database1.exportZOOD()

    // Second cycle: import normalized data, export again
    const dbStorage2 = createTestDBStorage('zzz')
    const database2 = new ZzzDatabase(1, dbStorage2)

    database2.importZOOD(firstExport, false, false)
    const secondExport = database2.exportZOOD()

    // The normalized JSON should be identical
    const firstJson = JSON.stringify(normalizeForComparison(firstExport))
    const secondJson = JSON.stringify(normalizeForComparison(secondExport))

    expect(secondJson).toBe(firstJson)
  })
})
