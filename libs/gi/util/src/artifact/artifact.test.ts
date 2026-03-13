import { artSubstatRollData } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  getSubstatEfficiency,
  getSubstatRolls,
  hasFourInitialSubstats,
} from './artifact'
import { makeArtifact, rollValue } from './testUtils'

const artifactSubstatRoll = allStats.art.subRoll

describe('Substat Rolls/efficiency', () => {
  test('should have valid rolls in substat roll table', () => {
    expect(Object.keys(artifactSubstatRoll[4]['critRate_'] ?? {})).toEqual(
      expect.arrayContaining(['5.6'])
    )
    expect(Object.keys(artifactSubstatRoll[4]['critDMG_'] ?? {})).toEqual(
      expect.arrayContaining(['4.4'])
    )
    expect(Object.keys(artifactSubstatRoll[4]['eleMas'] ?? {})).toEqual(
      expect.arrayContaining(['30'])
    )
    expect(Object.keys(artifactSubstatRoll[4]['def_'] ?? {})).toEqual(
      expect.arrayContaining(['5.8'])
    )

    expect(Object.keys(artifactSubstatRoll[5]['critRate_'] ?? {})).toEqual(
      expect.arrayContaining(['6.6', '12.4'])
    )
    expect(Object.keys(artifactSubstatRoll[5]['critDMG_'] ?? {})).toEqual(
      expect.arrayContaining(['6.2', '12.4', '21.0'])
    )
    expect(Object.keys(artifactSubstatRoll[5]['atk'] ?? {})).toEqual(
      expect.arrayContaining(['33'])
    )
    expect(Object.keys(artifactSubstatRoll[5]['def'] ?? {})).toEqual(
      expect.arrayContaining(['19', '63'])
    )
    expect(Object.keys(artifactSubstatRoll[5]['def_'] ?? {})).toEqual(
      expect.arrayContaining(['19.0', '13.9'])
    )
    expect(Object.keys(artifactSubstatRoll[5]['hp'] ?? {})).toEqual(
      expect.arrayContaining(['239'])
    )
    expect(Object.keys(artifactSubstatRoll[5]['eleMas'] ?? {})).toEqual(
      expect.arrayContaining(['23'])
    )

    expect(Object.keys(artifactSubstatRoll[5]['hp_'] ?? {})).toEqual(
      expect.arrayContaining(['26.3'])
    )
  })
  test('should get correct roll base', () => {
    const { low, high } = artSubstatRollData[5]
    expect(high).toBe(4)
    expect(low).toBe(3)
  })

  describe('getSubstatRolls()', () => {
    test('should get simple rolls', () => {
      expect(getSubstatRolls('def_', 5.8, 4)).toEqual([
        expect.arrayContaining([5.83]),
      ])
    })
    test('should get multiple rolls', () => {
      expect(getSubstatRolls('def_', 11.1, 4)).toEqual([[5.83, 5.25]])
    })
    test('should get multiple rolls with multiple options', () => {
      const rolls = getSubstatRolls('critDMG_', 32.6, 5)
      expect(rolls.length).toBeGreaterThan(1)
      rolls.forEach((roll) =>
        expect(roll.reduce((a, b) => a + b).toFixed(1)).toEqual('32.6')
      )
    })
    test('should reject close rolls', () => {
      // 31.9 - 32.6
      // Not exactly 31.9
      expect(getSubstatRolls('critDMG_', 32, 5)).toEqual([])
      // Too far from 31.9
      expect(getSubstatRolls('critDMG_', 32.4, 5)).toEqual([])
      // Too far from 32.6
      expect(getSubstatRolls('critDMG_', 32.3, 5)).toEqual([])
      // Not exactly 32.6
      expect(getSubstatRolls('critDMG_', 32.5, 5)).toEqual([])
    })
    test('deal with invalid', () => {
      expect(getSubstatRolls('def_', 10000, 4)).toEqual([])
      expect(getSubstatRolls('def_', 0, 4)).toEqual([])
    })
  })
  describe('getSubstatEfficiency()', () => {
    test('should deal with one roll', () => {
      expect(getSubstatEfficiency('def_', [0.0729 * 100])).toEqual(100)
      expect(getSubstatEfficiency('def_', [(0.0729 * 100) / 2])).toEqual(
        100 / 2
      )
    })
    test('should deal with invalids', () => {
      expect(getSubstatEfficiency('def_', [9999])).toEqual(100)
      expect(getSubstatEfficiency('def_', [9999, 9999, 9999, 9999])).toEqual(
        100
      )
      expect(getSubstatEfficiency('def_', [-1])).toEqual(0)
      expect(getSubstatEfficiency('', [-1])).toEqual(0)
    })
  })

  describe('hasFourInitialSubstats()', () => {
    test('should detect a level 0 4-liner', () => {
      const artifact = makeArtifact({
        level: 0,
        substats: [
          { key: 'critRate_', value: rollValue('critRate_', 3) },
          { key: 'critDMG_', value: rollValue('critDMG_', 3) },
          { key: 'atk_', value: rollValue('atk_', 3) },
          { key: 'hp_', value: rollValue('hp_', 3) },
        ],
      })

      expect(hasFourInitialSubstats(artifact)).toBe(true)
    })

    test('should reject a level 0 3-liner', () => {
      const artifact = makeArtifact({
        level: 0,
        substats: [
          { key: 'critRate_', value: rollValue('critRate_', 3) },
          { key: 'critDMG_', value: rollValue('critDMG_', 3) },
          { key: 'atk_', value: rollValue('atk_', 3) },
          { key: '', value: 0 },
        ],
      })

      expect(hasFourInitialSubstats(artifact)).toBe(false)
    })

    test('should detect a level 4 4-liner after one upgrade', () => {
      const artifact = makeArtifact({
        level: 4,
        substats: [
          { key: 'critRate_', value: rollValue('critRate_', 3, 2) },
          { key: 'critDMG_', value: rollValue('critDMG_', 3) },
          { key: 'atk_', value: rollValue('atk_', 3) },
          { key: 'hp_', value: rollValue('hp_', 3) },
        ],
      })

      expect(hasFourInitialSubstats(artifact)).toBe(true)
    })

    test('should reject a level 4 3-liner after the fourth stat unlocks', () => {
      const artifact = makeArtifact({
        level: 4,
        substats: [
          { key: 'critRate_', value: rollValue('critRate_', 3) },
          { key: 'critDMG_', value: rollValue('critDMG_', 3) },
          { key: 'atk_', value: rollValue('atk_', 3) },
          { key: 'hp_', value: rollValue('hp_', 3) },
        ],
      })

      expect(hasFourInitialSubstats(artifact)).toBe(false)
    })

    test('should reject non-5-star artifacts', () => {
      const artifact = {
        ...makeArtifact({
          level: 0,
          substats: [
            { key: 'critRate_', value: 2.7 },
            { key: 'critDMG_', value: 5.4 },
            { key: 'atk_', value: 4.1 },
            { key: 'hp_', value: 4.1 },
          ],
        }),
        rarity: 4 as const,
      }

      expect(hasFourInitialSubstats(artifact)).toBe(false)
    })

    test('should resolve ambiguous roll values through artifact meta inference', () => {
      const artifact = makeArtifact({
        level: 16,
        substats: [
          { key: 'critDMG_', value: 32.6 },
          { key: 'critRate_', value: rollValue('critRate_', 3) },
          { key: 'atk_', value: rollValue('atk_', 3) },
          { key: 'hp_', value: rollValue('hp_', 3) },
        ],
      })

      expect(getSubstatRolls('critDMG_', 32.6, 5).length).toBeGreaterThan(1)
      expect(hasFourInitialSubstats(artifact)).toBe(true)
    })
  })
})
