import { dumpFile } from '@genshin-optimizer/pipeline'
import { PROJROOT_PATH } from '../../consts'
import type { RelicStatSubDMKey } from '../../mapping'
import { statKeyMap } from '../../mapping'
import { readDMJSON } from '../../util'
import type { Value } from '../common'

export type RelicSubAffixConfig = {
  GroupID: number
  AffixID: number
  Property: RelicStatSubDMKey
  BaseValue: Value
  StepValue: Value
  StepNum: number
}

export const relicSubAffixConfig = JSON.parse(
  readDMJSON('ExcelOutput/RelicSubAffixConfig.json')
) as Record<'2' | '3' | '4' | '5', Record<string, RelicSubAffixConfig>>

const relicSubAffixConfigFlat = Object.values(relicSubAffixConfig).flatMap(
  (o) => Object.values(o)
)
dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicSubAffixConfig_gen.json`,
  relicSubAffixConfigFlat
)

dumpFile(`${PROJROOT_PATH}/src/dm/relic/RelicSubAffixConfig_keys_gen.json`, [
  ...new Set(relicSubAffixConfigFlat.map(({ Property }) => Property)),
])
dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicSubAffixConfig_keysmapped_gen.json`,
  [
    ...new Set(
      relicSubAffixConfigFlat.map(({ Property }) => statKeyMap[Property])
    ),
  ]
)
