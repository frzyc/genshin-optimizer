import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { PROJROOT_PATH } from '../../consts'
import type { AvatarId } from '../../mapping'
import { readDMJSON } from '../../util'

export type AvatarPromotionConfig = {
  AvatarID: number
  Promotion: number
  PromotionCostList: PromotionCostList[]
  MaxLevel: number
  PlayerLevelRequire?: number
  AttackBase: Value
  AttackAdd: Value
  DefenceBase: Value
  DefenceAdd: Value
  HPBase: Value
  HPAdd: Value
  SpeedBase: Value
  CriticalChance: Value
  CriticalDamage: Value
  BaseAggro: Value
  WorldLevelRequire?: number
}

export type Value = {
  Value: number
}

export type PromotionCostList = {
  ItemID: number
  ItemNum: number
}

const avatarPromotionConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/AvatarPromotionConfig.json'),
) as AvatarPromotionConfig[]

const avatarPromotionConfig = {} as Record<AvatarId, AvatarPromotionConfig[]>
avatarPromotionConfigSrc.forEach((config) => {
  if (!avatarPromotionConfig[config.AvatarID])
    avatarPromotionConfig[config.AvatarID] = []
  avatarPromotionConfig[config.AvatarID].push(config)
})

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarPromotionConfig_arrayed_gen.json`,
  avatarPromotionConfig,
)
export { avatarPromotionConfig }
