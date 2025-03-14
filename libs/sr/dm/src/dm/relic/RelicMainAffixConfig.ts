import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { PROJROOT_PATH } from '../../consts'
import type { RelicStatMainDMKey } from '../../mapping'
import { statKeyMap } from '../../mapping'
import { readDMJSON } from '../../util'
import type { Value } from '../common'

export type RelicMainAffixConfig = {
  GroupID: number
  AffixID: number
  Property: RelicStatMainDMKey
  BaseValue: Value
  LevelAdd: Value
  IsAvailable: boolean
}

export const relicMainAffixConfig = JSON.parse(
  readDMJSON('ExcelOutput/RelicMainAffixConfig.json'),
) as RelicMainAffixConfig[]

dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_groupId_gen.json`,
  [...new Set(relicMainAffixConfig.map(({ GroupID }) => GroupID.toString()))],
)
dumpFile(`${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_keys_gen.json`, [
  ...new Set(relicMainAffixConfig.map(({ Property }) => Property)),
])
dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_keysmapped_gen.json`,
  [
    ...new Set(
      relicMainAffixConfig.map(({ Property }) => statKeyMap[Property]),
    ),
  ],
)
