import Artifact from "./Artifact";
import { ArtifactSheet } from "./ArtifactSheet";

//post-load the artifact data
// beforeAll(() => Artifact.getDataImport());


describe('Substat Rolls/efficiency', () => {
  test('should get correct roll base', () => {
    const { low, high } = Artifact.rollInfo(5)
    expect(high).toBe(4)
    expect(low).toBe(3)
  })

  describe('Artifact.getSubstatRolls()', () => {
    test('should get simple rolls', () => {
      expect(Artifact.getSubstatRolls("def_", 5.8, 4)).toEqual([expect.arrayContaining([5.83])])
    })
    test('should get multiple rolls ', () => {
      expect(Artifact.getSubstatRolls("def_", 11.1, 4)).toEqual([[5.25, 5.83]])
    })
    test('should get multiple rolls with multiple options', () => {
      expect(Artifact.getSubstatRolls("critDMG_", 32.6, 5)).toEqual(expect.arrayContaining([
        [5.44, 6.22, 6.99, 6.99, 6.99], [5.44, 5.44, 5.44, 5.44, 5.44, 5.44]
      ]))
    })
    test('should reject close rolls', () => {
      // 31.9 - 32.6
      // Not exactly 31.9
      expect(Artifact.getSubstatRolls("critDMG_", 32, 5)).toEqual([])
      // Too far from 31.9
      expect(Artifact.getSubstatRolls("critDMG_", 32.4, 5)).toEqual([])
      // Too far from 32.6
      expect(Artifact.getSubstatRolls("critDMG_", 32.3, 5)).toEqual([])
      // Not exactly 32.6
      expect(Artifact.getSubstatRolls("critDMG_", 32.5, 5)).toEqual([])
    })
    test('deal with invalid', () => {
      expect(Artifact.getSubstatRolls("def_", 10000, 4)).toEqual([])
      expect(Artifact.getSubstatRolls("def_", 0, 4)).toEqual([])
    })
  })
  describe('Artifact.getSubstatEfficiency()', () => {
    test('should deal with one roll', () => {
      expect(Artifact.getSubstatEfficiency("def_", [7.29])).toEqual(100)
      expect(Artifact.getSubstatEfficiency("def_", [7.29 / 2])).toEqual(100 / 2)
    })
    test('should deal with invalids', () => {
      expect(Artifact.getSubstatEfficiency("def_", [9999])).toEqual(100)
      expect(Artifact.getSubstatEfficiency("def_", [9999, 9999, 9999, 9999])).toEqual(100)
      expect(Artifact.getSubstatEfficiency("def_", [-1])).toEqual(0)
      expect(Artifact.getSubstatEfficiency("", [-1])).toEqual(0)
    })
  })
})
test('getAllArtifactSetEffectsObj', async () => {
  const sheets = await ArtifactSheet.getAll()
  const stats1 = {}
  expect(Artifact.setEffectsObjs(sheets, stats1 as any).RetracingBolide).toEqual({ 2: { powShield_: 35 } })
  const stats2 = { conditionalValues: { artifact: { RetracingBolide: { set4: [1] } } } }
  expect(Artifact.setEffectsObjs(sheets, stats2 as any).RetracingBolide).toEqual({ 2: { powShield_: 35 }, 4: { normal_dmg_: 40, charged_dmg_: 40 } })
})