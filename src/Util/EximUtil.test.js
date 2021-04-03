import { exportUInt, importUInt } from "./EximUtil"

describe('Export Import', () => {
  test('roundtrip integers', () => {
    for (let j = 0; j < 4000; j++) {
      expect(importUInt(exportUInt(j, 3))).toEqual(j)
    }
  })
})
