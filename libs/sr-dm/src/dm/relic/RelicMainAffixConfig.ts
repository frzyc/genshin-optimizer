import { dumpFile } from '@genshin-optimizer/pipeline'
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

const groupId = [
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '433',
  '434',
  '436',
  '441',
  '443',
] as const

type GroupId = (typeof groupId)[number]

export const relicMainAffixConfig = JSON.parse(
  readDMJSON('ExcelOutput/RelicMainAffixConfig.json')
) as Record<GroupId, Record<string, RelicMainAffixConfig>>

export const relicMainAffixConfigFlat = Object.values(
  relicMainAffixConfig
).flatMap((o) => Object.values(o))
dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_gen.json`,
  relicMainAffixConfigFlat
)
dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_groupId_gen.json`,
  [
    ...new Set(
      relicMainAffixConfigFlat.map(({ GroupID }) => GroupID.toString())
    ),
  ]
)
dumpFile(`${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_keys_gen.json`, [
  ...new Set(relicMainAffixConfigFlat.map(({ Property }) => Property)),
])
dumpFile(
  `${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_keysmapped_gen.json`,
  [
    ...new Set(
      relicMainAffixConfigFlat.map(({ Property }) => statKeyMap[Property])
    ),
  ]
)
