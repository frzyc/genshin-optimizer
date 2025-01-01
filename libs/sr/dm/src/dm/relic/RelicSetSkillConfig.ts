import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { objMap } from '@genshin-optimizer/common/util'
import type { RelicSetCountKey } from '@genshin-optimizer/sr/consts'
import { PROJROOT_PATH } from '../../consts'
import type { StatDMKey } from '../../mapping'
import type { RelicSetId } from '../../mapping/relic'
import { relicSetIdMap } from '../../mapping/relic'
import { readDMJSON } from '../../util'
import type { Value } from '../common'

export type RelicSetSkillConfig = {
  SetID: number
  RequireNum: RelicSetCountKey
  SkillDesc: string
  PropertyList: Property[]
  AbilityName: string
  AbilityParamList: Value[]
}
type ObfRelicSetSkillConfig = Omit<RelicSetSkillConfig, 'PropertyList'> & {
  PropertyList: object[]
}
type Property = {
  PropertyName: StatDMKey
  Value: Value
}

const relicSetSkillConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/RelicSetSkillConfig.json')
) as ObfRelicSetSkillConfig[]

export const relicSetSkillConfig = relicSetSkillConfigSrc.reduce(
  (configMap, config) => {
    if (!relicSetIdMap[config.SetID]) return configMap

    const { SetID, RequireNum, PropertyList } = config
    // Convert obfuscated names to unobfuscated names, assuming that the ordering of the object fields stays the same
    const unobfPropertyList: Property[] = PropertyList.map((prop) => {
      const fields = Object.values(prop) as [StatDMKey, Value]
      return {
        PropertyName: fields[0],
        Value: fields[1],
      }
    })
    const unobfConfig = {
      ...config,
      PropertyList: unobfPropertyList,
    }
    if (!configMap[SetID])
      configMap[SetID] = {} as Record<RelicSetCountKey, RelicSetSkillConfig>
    configMap[SetID][RequireNum] = unobfConfig
    return configMap
  },
  {} as Record<RelicSetId, Record<RelicSetCountKey, RelicSetSkillConfig>>
)

const prePath = `${PROJROOT_PATH}/src/dm/relic/RelicSetSkillConfig`

export const relicSetSkillConfig_bySet = objMap(
  relicSetSkillConfig,
  (setNumConfig) => Object.values(setNumConfig)
)

dumpFile(`${prePath}_bySet_gen.json`, relicSetSkillConfig_bySet)
