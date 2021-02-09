import Artifact from "./Artifact";

//post-load the artifact data
// beforeAll(() => Artifact.getDataImport());

describe('Testing Artifact.js', () => {
  describe('SubStat Rolls/efficiency', () => {
    test('should get correct roll base', () => {
      expect(Artifact.getBaseSubRollNumHigh(5)).toBe(4)
      expect(Artifact.getBaseSubRollNumLow(5)).toBe(3)
    })
    describe('Artifact.getSubstatRolls()', () => {
      test('should get simple rolls', () => {
        expect(Artifact.getSubstatRolls("def_", 5.8, 4)).toEqual([[5.8]])
      })
      test('should get multiple rolls ', () => {
        expect(Artifact.getSubstatRolls("def_", 11.1, 4)).toEqual([[5.8, 5.3]])
      })
      test('should get multiple rolls with multiple options', () => {//5.8+4.1 = 9.9 which is "close enough"
        expect(Artifact.getSubstatRolls("def_", 10, 4)).toEqual([[5.8, 4.1], [5.3, 4.7]])
      })
      test('deal with invalid', () => {
        expect(Artifact.getSubstatRolls("def_", 10000, 4)).toEqual([])
        expect(Artifact.getSubstatRolls("def_", 0, 4)).toEqual([])
        expect(Artifact.getSubstatRolls("def_", 10, 0)).toEqual([])
      })
    })
    describe('Artifact.getSubstatEfficiency()', () => {
      test('should deal with one roll', () => {
        expect(Artifact.getSubstatEfficiency("def_", [7.3])).toEqual(100)
        expect(Artifact.getSubstatEfficiency("def_", [7.3 / 2])).toEqual(100 / 2)
      })
      test('should deal with invalids', () => {
        expect(Artifact.getSubstatEfficiency("def_", [9999])).toEqual(100)
        expect(Artifact.getSubstatEfficiency("def_", [9999, 9999, 9999, 9999])).toEqual(100)
        expect(Artifact.getSubstatEfficiency("def_", [-1])).toEqual(0)
        expect(Artifact.getSubstatEfficiency("", [-1])).toEqual(0)
        expect(Artifact.getSubstatEfficiency()).toEqual(0)
      })
    })
  })
})
