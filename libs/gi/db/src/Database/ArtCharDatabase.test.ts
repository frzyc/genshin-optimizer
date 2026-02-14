import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from './ArtCharDatabase'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testDatabaseJson = require('./Van_2025-07-16_19-59-13.json')

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
    const dbStorage1 = createTestDBStorage('go')
    const database1 = new ArtCharDatabase(1, dbStorage1)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input = structuredClone(testDatabaseJson) as any
    database1.importGOOD(input, false, false)
    const firstExport = database1.exportGOOD()

    // Second cycle: import normalized data, export again
    const dbStorage2 = createTestDBStorage('go')
    const database2 = new ArtCharDatabase(1, dbStorage2)

    database2.importGOOD(firstExport, false, false)
    const secondExport = database2.exportGOOD()

    // The normalized JSON should be identical
    const firstJson = JSON.stringify(normalizeForComparison(firstExport))
    const secondJson = JSON.stringify(normalizeForComparison(secondExport))

    expect(secondJson).toBe(firstJson)
  })
})
