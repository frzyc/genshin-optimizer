import { filterFunction } from '@genshin-optimizer/common/util'
import {
  initialFilterOption,
  type IArtifact,
} from '@genshin-optimizer/gi/schema'
import { getSubstatValuesPercent } from './artifact'
import { artifactFilterConfigs } from './artifactSortUtil'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'

function rollValue(key: SubstatKey, rarity: 4 | 5, ...indices: number[]) {
  const values = getSubstatValuesPercent(key, rarity)
  return indices.reduce((sum, index) => sum + values[index], 0)
}

function makeArtifact(
  id: string,
  artifact: Partial<IArtifact> &
    Pick<IArtifact, 'rarity' | 'level' | 'substats'>
) {
  return {
    id,
    setKey: artifact.setKey ?? 'GladiatorsFinale',
    slotKey: artifact.slotKey ?? 'flower',
    level: artifact.level,
    rarity: artifact.rarity,
    mainStatKey: artifact.mainStatKey ?? 'hp',
    location: artifact.location ?? '',
    lock: artifact.lock ?? false,
    substats: artifact.substats,
  }
}

describe('artifactFilterConfigs()', () => {
  const fourLiner = makeArtifact('four-liner', {
    rarity: 5,
    level: 4,
    substats: [
      { key: 'critRate_', value: rollValue('critRate_', 5, 3, 2) },
      { key: 'critDMG_', value: rollValue('critDMG_', 5, 3) },
      { key: 'atk_', value: rollValue('atk_', 5, 3) },
      { key: 'hp_', value: rollValue('hp_', 5, 3) },
    ],
  })
  const notFourLiner = makeArtifact('not-four-liner', {
    rarity: 5,
    level: 4,
    substats: [
      { key: 'critRate_', value: rollValue('critRate_', 5, 3) },
      { key: 'critDMG_', value: rollValue('critDMG_', 5, 3) },
      { key: 'atk_', value: rollValue('atk_', 5, 3) },
      { key: 'hp_', value: rollValue('hp_', 5, 3) },
    ],
  })
  const fourStar = makeArtifact('four-star', {
    rarity: 4,
    level: 0,
    substats: [
      { key: 'critRate_', value: rollValue('critRate_', 4, 3) },
      { key: 'critDMG_', value: rollValue('critDMG_', 4, 3) },
      { key: 'atk_', value: rollValue('atk_', 4, 3) },
      { key: 'hp_', value: rollValue('hp_', 4, 3) },
    ],
  })
  const allArtifacts = [fourLiner, notFourLiner, fourStar]
  const filterConfigs = artifactFilterConfigs()

  test('should include only 4-liners when filtered', () => {
    const filterOption = {
      ...initialFilterOption(),
      initialSubstats: ['fourLiner'] as const,
    }

    const filtered = allArtifacts
      .filter(filterFunction(filterOption, filterConfigs))
      .map(({ id }) => id)

    expect(filtered).toEqual(['four-liner'])
  })

  test('should include non-4-liners when filtered', () => {
    const filterOption = {
      ...initialFilterOption(),
      initialSubstats: ['notFourLiner'] as const,
    }

    const filtered = allArtifacts
      .filter(filterFunction(filterOption, filterConfigs))
      .map(({ id }) => id)

    expect(filtered).toEqual(['not-four-liner', 'four-star'])
  })

  test('should include all artifacts by default', () => {
    const filtered = allArtifacts
      .filter(filterFunction(initialFilterOption(), filterConfigs))
      .map(({ id }) => id)

    expect(filtered).toEqual(['four-liner', 'not-four-liner', 'four-star'])
  })
})
