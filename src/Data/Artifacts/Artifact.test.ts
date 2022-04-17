import Artifact from "./Artifact";
import artifactSubstatRoll from './artifact_sub_rolls_gen.json';

describe('Substat Rolls/efficiency', () => {
  test('should have valid rolls in substat roll table', () => {
    expect(Object.keys(artifactSubstatRoll[4]?.["critRate_"] ?? {}))
      .toEqual(expect.arrayContaining(["5.6"]))
    expect(Object.keys(artifactSubstatRoll[4]?.["critDMG_"] ?? {}))
      .toEqual(expect.arrayContaining(["4.4"]))
    expect(Object.keys(artifactSubstatRoll[4]?.["eleMas"] ?? {}))
      .toEqual(expect.arrayContaining(["30"]))
    expect(Object.keys(artifactSubstatRoll[4]?.["def_"] ?? {}))
      .toEqual(expect.arrayContaining(["5.8"]))

    expect(Object.keys(artifactSubstatRoll[5]?.["critRate_"] ?? {}))
      .toEqual(expect.arrayContaining(["6.6", "12.4"]))
    expect(Object.keys(artifactSubstatRoll[5]?.["critDMG_"] ?? {}))
      .toEqual(expect.arrayContaining(["6.2", "12.4", "21.0"]))
    expect(Object.keys(artifactSubstatRoll[5]?.["atk"] ?? {}))
      .toEqual(expect.arrayContaining(["33"]))
    expect(Object.keys(artifactSubstatRoll[5]?.["def"] ?? {}))
      .toEqual(expect.arrayContaining(["19", "63"]))
    expect(Object.keys(artifactSubstatRoll[5]?.["def_"] ?? {}))
      .toEqual(expect.arrayContaining(["19.0", "13.9"]))
    expect(Object.keys(artifactSubstatRoll[5]?.["hp"] ?? {}))
      .toEqual(expect.arrayContaining(["239"]))
    expect(Object.keys(artifactSubstatRoll[5]?.["eleMas"] ?? {}))
      .toEqual(expect.arrayContaining(["23"]))

    expect(Object.keys(artifactSubstatRoll[5]?.["hp_"] ?? {}))
      .toEqual(expect.arrayContaining(["26.3"]))
  })
  test('should get correct roll base', () => {
    const { low, high } = Artifact.rollInfo(5)
    expect(high).toBe(4)
    expect(low).toBe(3)
  })

  describe('Artifact.getSubstatRolls()', () => {
    test('should get simple rolls', () => {
      expect(Artifact.getSubstatRolls("def_", 5.8, 4)).toEqual([expect.arrayContaining([5.83])])
    })
    test('should get multiple rolls', () => {
      expect(Artifact.getSubstatRolls("def_", 11.1, 4)).toEqual([[5.83, 5.25,]])
    })
    test('should get multiple rolls with multiple options', () => {
      const rolls = Artifact.getSubstatRolls("critDMG_", 32.6, 5)
      expect(rolls.length).toBeGreaterThan(1)
      rolls.forEach(roll =>
        expect(roll.reduce((a, b) => a + b).toFixed(1)).toEqual("32.6"))
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
      expect(Artifact.getSubstatEfficiency("def_", [0.0729 * 100])).toEqual(100)
      expect(Artifact.getSubstatEfficiency("def_", [0.0729 * 100 / 2])).toEqual(100 / 2)
    })
    test('should deal with invalids', () => {
      expect(Artifact.getSubstatEfficiency("def_", [9999])).toEqual(100)
      expect(Artifact.getSubstatEfficiency("def_", [9999, 9999, 9999, 9999])).toEqual(100)
      expect(Artifact.getSubstatEfficiency("def_", [-1])).toEqual(0)
      expect(Artifact.getSubstatEfficiency("", [-1])).toEqual(0)
    })
  })
})
