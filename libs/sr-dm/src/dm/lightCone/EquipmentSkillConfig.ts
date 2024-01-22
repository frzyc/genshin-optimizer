import { dumpFile } from '@genshin-optimizer/pipeline'
import { objFilterKeys, objMap } from '@genshin-optimizer/util'
import { PROJROOT_PATH } from '../../consts'
import type { StatDMKey } from '../../mapping'
import type { LightConeId } from '../../mapping/lightCone'
import { lightConeIdMap } from '../../mapping/lightCone'
import { readDMJSON } from '../../util'
import type { HashId, Value } from '../common'

export type EquipmentSkillConfig = {
  SkillID: number
  SkillName: HashId
  SkillDesc: HashId
  Level: number
  AbilityName: string
  ParamList: Value[]
  AbilityProperty: AbilityProperty[]
}
type AbilityProperty = {
  PropertyType: StatDMKey
  Value: Value
}

const equipmentSkillConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/EquipmentSkillConfig.json')
) as Record<string, Record<string, EquipmentSkillConfig>>

const filteredEquipmentSkillConfigSrc = objFilterKeys(
  equipmentSkillConfigSrc,
  Object.keys(lightConeIdMap) as LightConeId[]
)

const srcToFlatConfig = (v: Record<string, EquipmentSkillConfig>) =>
  Object.values(v)

export const equipmentSkillConfig = objMap(
  filteredEquipmentSkillConfigSrc,
  srcToFlatConfig
) as Record<LightConeId, EquipmentSkillConfig[]>

dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/equipmentSkillConfig_gen.json`,
  equipmentSkillConfig
)
