import { filterFunction } from '@genshin-optimizer/common/util'
import { initialFilterOption } from '@genshin-optimizer/gi/schema'
import { artifactFilterConfigs } from './artifactSortUtil'
import { makeArtifact, rollValue } from './testUtils'

describe('artifactFilterConfigs()', () => {
  const fourLiner = makeArtifact({
    id: 'four-liner',
    rarity: 5,
    level: 4,
    substats: [
      { key: 'critRate_', value: rollValue('critRate_', 5, 3, 2) },
      { key: 'critDMG_', value: rollValue('critDMG_', 5, 3) },
      { key: 'atk_', value: rollValue('atk_', 5, 3) },
      { key: 'hp_', value: rollValue('hp_', 5, 3) },
    ],
  })
  const notFourLiner = makeArtifact({
    id: 'not-four-liner',
    rarity: 5,
    level: 4,
    substats: [
      { key: 'critRate_', value: rollValue('critRate_', 5, 3) },
      { key: 'critDMG_', value: rollValue('critDMG_', 5, 3) },
      { key: 'atk_', value: rollValue('atk_', 5, 3) },
      { key: 'hp_', value: rollValue('hp_', 5, 3) },
    ],
  })
  const fourStar = makeArtifact({
    id: 'four-star',
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
