import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import { artSubstatRollData } from '@genshin-optimizer/gi/consts'
import type { IArtifact } from '@genshin-optimizer/gi/good'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  getArtifactEfficiency,
  getSubstatEfficiency,
  getSubstatRolls,
} from './artifact'

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

  describe('getArtifactEfficiency()', () => {
    const baseArtifact: IArtifact = {
      setKey: 'GladiatorsFinale',
      rarity: 5,
      level: 0,
      slotKey: 'flower',
      mainStatKey: 'hp',
      location: '',
      lock: false,
      substats: [],
    }
    const usefulFilter = new Set<SubstatKey>([
      'critRate_',
      'critDMG_',
      'atk_',
      'enerRech_',
    ])

    test('should not count substats that are excluded by the filter', () => {
      // +0 artifact whose 4 known substats are all excluded by the filter.
      // The unactivated 4th line has a known key, so no upgrade can roll into
      // a useful stat: max efficiency should be 0.
      // https://github.com/frzyc/genshin-optimizer/issues/3152
      const artifact: IArtifact = {
        ...baseArtifact,
        substats: [
          { key: 'def_', value: 0 },
          { key: 'def', value: 0 },
          { key: 'hp_', value: 0 },
          { key: '', value: 0 },
        ],
        unactivatedSubstats: [{ key: 'eleMas', value: 21 }],
      }
      const { currentEfficiency, maxEfficiency } = getArtifactEfficiency(
        artifact,
        usefulFilter
      )
      expect(currentEfficiency).toBe(0)
      expect(maxEfficiency).toBe(0)
    })

    test('should count an unactivated substat towards max efficiency when selected by the filter', () => {
      const artifact: IArtifact = {
        ...baseArtifact,
        substats: [
          { key: 'critRate_', value: 3.9 },
          { key: 'critDMG_', value: 7.8 },
          { key: 'atk_', value: 5.8 },
          { key: '', value: 0 },
        ],
        unactivatedSubstats: [{ key: 'eleMas', value: 23 }],
      }
      const filter = new Set<SubstatKey>([...usefulFilter, 'eleMas'])
      const { currentEfficiency, maxEfficiency } = getArtifactEfficiency(
        artifact,
        filter
      )
      // 3 current max rolls + the unactivated EM line (1 max roll) + the 4
      // remaining upgrades at max roll value.
      expect(currentEfficiency).toBeCloseTo(3)
      expect(maxEfficiency).toBeCloseTo(8)
    })

    test('should count potential rolls into empty slots for a 3-liner', () => {
      const artifact: IArtifact = {
        ...baseArtifact,
        substats: [
          { key: 'critRate_', value: 3.9 },
          { key: 'critDMG_', value: 7.8 },
          { key: 'atk_', value: 5.8 },
          { key: '', value: 0 },
        ],
      }
      const { currentEfficiency, maxEfficiency } = getArtifactEfficiency(
        artifact,
        usefulFilter
      )
      // 3 current max rolls + 1 roll to unlock the 4th line + the 4 remaining
      // upgrades at max roll value.
      expect(currentEfficiency).toBeCloseTo(3)
      expect(maxEfficiency).toBeCloseTo(8)
    })
  })
})
