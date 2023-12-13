import { dumpFile } from '@genshin-optimizer/pipeline'
import { objFilterKeys, objMap } from '@genshin-optimizer/util'
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
  readDMJSON('ExcelOutput/EquipmentPromotionConfig.json')
) as Record<string, Record<string, EquipmentPromotionConfig>>

export const equipmentPromotionConfig = objMap(
  objFilterKeys(
    equipmentPromotionConfigSrc,
    Object.keys(lightConeIdMap) as LightConeId[]
  ) as Record<LightConeId, Record<string, EquipmentPromotionConfig>>,
  (v: Record<string, EquipmentPromotionConfig>) => Object.values(v)
) as Record<LightConeId, EquipmentPromotionConfig[]>

dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/equipmentPromotionConfig_gen.json`,
  equipmentPromotionConfig
)
