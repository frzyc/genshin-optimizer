import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import type { SuperimposeKey } from '@genshin-optimizer/sr/consts'
import { parse } from 'json-bigint'
import { PROJROOT_PATH } from '../../consts'
import type { StatDMKey } from '../../mapping'
import type { LightConeId } from '../../mapping/lightCone'
import { lightConeIdMap } from '../../mapping/lightCone'
import { readDMJSON } from '../../util'
import type { HashId, Value } from '../common'
import { equipmentConfig } from './EquipmentConfig'

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

const equipmentSkillConfigSrc = parse(
  readDMJSON('ExcelOutput/EquipmentSkillConfig.json')
) as EquipmentSkillConfig[]

const skillIdToLightConeIdMap = objKeyValMap(
  Object.values(equipmentConfig),
  (config) => [config.SkillID, config.EquipmentID]
)

export const equipmentSkillConfig = equipmentSkillConfigSrc.reduce(
  (fullConfig, config) => {
    const { SkillID } = config
    const lightConeId = skillIdToLightConeIdMap[SkillID]
    if (!lightConeIdMap[lightConeId]) return fullConfig

    if (!fullConfig[lightConeId])
      fullConfig[lightConeId] = [] as EquipmentSkillConfig[]
    fullConfig[lightConeId].push(config)
    return fullConfig
  },
  {} as Record<LightConeId, EquipmentSkillConfig[]>
)

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
