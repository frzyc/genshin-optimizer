import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type { RelicRarityKey } from '@genshin-optimizer/sr/consts'
import { PROJROOT_PATH } from '../../consts'
import type { RelicStatSubDMKey } from '../../mapping'
import { statKeyMap } from '../../mapping'
import { readDMJSON } from '../../util'
import type { Value } from '../common'

export type RelicSubAffixConfig = {
  GroupID: RelicRarityKey
  AffixID: number
  Property: RelicStatSubDMKey
  BaseValue: Value
  StepValue: Value
  StepNum: number
}

const relicSubAffixConfigFlat = JSON.parse(
  readDMJSON('ExcelOutput/RelicSubAffixConfig.json'),
) as RelicSubAffixConfig[]

export const relicSubAffixConfig = relicSubAffixConfigFlat.reduce(
  (fullConfig, config) => {
    const { GroupID, AffixID } = config
    if (!fullConfig[GroupID])
      fullConfig[GroupID] = {} as Record<string, RelicSubAffixConfig>
    fullConfig[GroupID][`${AffixID}`] = config
    return fullConfig
  },
  {} as Record<RelicRarityKey, Record<string, RelicSubAffixConfig>>,
)

dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicSubAffixConfig_gen.json`,
  relicSubAffixConfig,
)

dumpFile(`${PROJROOT_PATH}/src/dm/relic/RelicSubAffixConfig_keys_gen.json`, [
  ...new Set(relicSubAffixConfigFlat.map(({ Property }) => Property)),
])
dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicSubAffixConfig_keysmapped_gen.json`,
  [
    ...new Set(
      relicSubAffixConfigFlat.map(({ Property }) => statKeyMap[Property]),
    ),
  ],
)
