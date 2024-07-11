import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { objFilterKeys, objMap } from '@genshin-optimizer/common/util'
import type { SuperimposeKey } from '@genshin-optimizer/sr/consts'
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
  Level: SuperimposeKey
  AbilityName: string
  ParamList: Value[]
  AbilityProperty: AbilityProperty[]
}
type AbilityProperty = {
  PropertyType: StatDMKey
  Value: Value
}

type EquipmentSkillConfig_bySuperimpose = {
  SkillID: number[]
  SkillName: HashId[]
  SkillDesc: HashId[]
  Level: SuperimposeKey[]
  AbilityName: string[]
  ParamList: Value[][]
  AbilityProperty: AbilityProperty[][]
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

// Convert from skill.superimpose.param -> skill.param[] where each entry is a superimpose
export const equipmentSkillConfig_bySuperimpose = objMap(
  equipmentSkillConfig,
  (configs) => {
    const flatConfig = {} as Record<string, any>
    configs.forEach((config) =>
      Object.entries(config).forEach(([key, value]) => {
        if (!flatConfig[key]) {
          flatConfig[key] = []
        }
        flatConfig[key].push(value)
      })
    )
    return flatConfig as EquipmentSkillConfig_bySuperimpose
  }
)

dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/equipmentSkillConfig_bySuperimpose_gen.json`,
  equipmentSkillConfig_bySuperimpose
)
