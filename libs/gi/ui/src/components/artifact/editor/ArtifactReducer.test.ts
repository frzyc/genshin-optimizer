import type { IArtifact } from '@genshin-optimizer/gi/good'
import { artifactReducer } from './ArtifactReducer'

const baseArtifact: IArtifact = {
  setKey: 'GladiatorsFinale',
  rarity: 5,
  level: 0,
  slotKey: 'flower',
  mainStatKey: 'hp',
  location: '',
  lock: false,
  substats: [
    { key: 'critRate_', value: 3.9, initialValue: 3.9 },
    { key: 'critDMG_', value: 7.8, initialValue: 7.8 },
    { key: 'atk_', value: 5.8, initialValue: 5.8 },
    { key: '', value: 0 },
  ],
}

describe('artifactReducer', () => {
  it('clears artifact state on reset', () => {
    expect(artifactReducer(baseArtifact, { type: 'reset' })).toBeUndefined()
  })

  it('replaces artifact state on overwrite', () => {
    const artifact = artifactReducer(baseArtifact, {
      type: 'overwrite',
      artifact: {
        ...baseArtifact,
        level: 12,
        lock: true,
        substats: [
          { key: 'def_', value: 7.3 },
          { key: 'def', value: 23 },
          { key: 'atk', value: 19 },
          { key: '', value: 0 },
        ],
      },
    })

    expect(artifact?.level).toBe(12)
    expect(artifact?.lock).toBe(true)
    expect(artifact?.substats[0].key).toBe('def_')
  })

  it('swaps active substats instead of duplicating keys', () => {
    const artifact = artifactReducer(baseArtifact, {
      type: 'substat',
      index: 1,
      substat: { key: 'critRate_', value: 4.7 },
    })

    expect(artifact?.substats[0].key).toBe('critDMG_')
    expect(artifact?.substats[1].key).toBe('critRate_')
  })

  it('clears unactivated substats when editing active substats', () => {
    const artifact = artifactReducer(
      {
        ...baseArtifact,
        unactivatedSubstats: [{ key: 'def_', value: 7.3, initialValue: 7.3 }],
      },
      {
        type: 'substat',
        index: 0,
        substat: { key: 'critRate_', value: 4.7 },
      }
    )

    expect(artifact?.unactivatedSubstats?.some(({ key }) => key)).toBe(false)
  })

  it('returns undefined for invalid artifact updates', () => {
    const artifact = artifactReducer(baseArtifact, {
      type: 'update',
      artifact: { mainStatKey: 'critRate_' },
    })

    expect(artifact).toBeUndefined()
  })

  it('updates known totalRolls on the 3-line track', () => {
    const artifact = artifactReducer(
      {
        ...baseArtifact,
        totalRolls: 3,
        unactivatedSubstats: [{ key: 'def_', value: 7.3, initialValue: 7.3 }],
      },
      { type: 'update', artifact: { level: 20 } }
    )

    expect(artifact?.totalRolls).toBe(8)
  })

  it('updates known totalRolls on the 4-line track', () => {
    const artifact = artifactReducer(
      {
        ...baseArtifact,
        substats: [
          ...baseArtifact.substats.slice(0, 3),
          { key: 'def_', value: 7.3, initialValue: 7.3 },
        ],
        totalRolls: 4,
      },
      { type: 'update', artifact: { level: 20 } }
    )

    expect(artifact?.totalRolls).toBe(9)
  })

  it('leaves unknown totalRolls unknown', () => {
    const artifact = artifactReducer(baseArtifact, {
      type: 'update',
      artifact: { level: 20 },
    })

    expect(artifact?.totalRolls).toBeUndefined()
  })

  it('preserves initialValue when editing substats', () => {
    const editedArtifact = artifactReducer(baseArtifact, {
      type: 'substat',
      index: 0,
      substat: { key: 'critRate_', value: 4.7 },
    })
    expect(editedArtifact?.substats[0].initialValue).toBe(3.9)

    const activatedArtifact = artifactReducer(
      {
        ...baseArtifact,
        totalRolls: 3,
        unactivatedSubstats: [{ key: 'def_', value: 7.3, initialValue: 7.3 }],
      },
      {
        type: 'unactivatedSubstat',
        index: 3,
        substat: { key: 'def_', value: 8.1 },
      }
    )

    expect(activatedArtifact?.unactivatedSubstats?.[0]?.initialValue).toBe(7.3)
  })
})
