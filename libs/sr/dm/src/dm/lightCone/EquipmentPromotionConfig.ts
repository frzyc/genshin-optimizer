import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { PROJROOT_PATH } from '../../consts'
import type { LightConeId } from '../../mapping/lightCone'
import { lightConeIdMap } from '../../mapping/lightCone'
import { readDMJSON } from '../../util'
import type { MaterialValue, Value } from '../common'

export type EquipmentPromotionConfig = {
  EquipmentID: number
  Promotion: number
  PromotionCostList: MaterialValue[]
  PlayerLevelRequire?: number
  MaxLevel: number
  BaseHP: Value
  BaseHPAdd: Value
  BaseAttack: Value
  BaseAttackAdd: Value
  BaseDefence: Value
  BaseDefenceAdd: Value
  WorldLevelRequire?: number
}

const equipmentPromotionConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/EquipmentPromotionConfig.json'),
) as EquipmentPromotionConfig[]

export const equipmentPromotionConfig = equipmentPromotionConfigSrc.reduce(
  (fullConfig, config) => {
    if (!lightConeIdMap[config.EquipmentID]) return fullConfig

    if (!fullConfig[config.EquipmentID])
      fullConfig[config.EquipmentID] = [] as EquipmentPromotionConfig[]
    fullConfig[config.EquipmentID].push(config)
    return fullConfig
  },
  {} as Record<LightConeId, EquipmentPromotionConfig[]>,
)

dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/equipmentPromotionConfig_gen.json`,
  equipmentPromotionConfig,
)
