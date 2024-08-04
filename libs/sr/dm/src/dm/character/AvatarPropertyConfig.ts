import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { PROJROOT_PATH } from '../../consts'
import { readDMJSON } from '../../util'
import type { HashId } from '../common'

export type AvatarPropertyConfig = {
  PropertyType: string
  PropertyName: HashId
  PropertyNameSkillTree: HashId
  PropertyNameRelic: HashId
  PropertyNameFilter: HashId
  IsDisplay?: boolean
  isBattleDisplay?: boolean
  Order: number
  IconPath: string
  MainRelicFilter?: number
  SubRelicFilter?: number
  PropertyInstructionID?: number
  PropertyClassify?: number
}

const AvatarPropertyConfig = JSON.parse(
  readDMJSON('ExcelOutput/AvatarPropertyConfig.json')
) as AvatarPropertyConfig[]

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarPropertyConfig_list_gen.json`,
  AvatarPropertyConfig.map((config) => config.PropertyType)
)
export { AvatarPropertyConfig }
