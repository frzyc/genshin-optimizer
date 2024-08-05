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
// TODO: update these once Dim updates the datamine
type Property = {
  LFJEANLMLHE: StatDMKey // PropertyName
  DIBKEHHCPAP: Value // Value
}

const relicSetSkillConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/RelicSetSkillConfig.json')
) as RelicSetSkillConfig[]

export const relicSetSkillConfig = relicSetSkillConfigSrc.reduce(
  (configMap, config) => {
    if (!relicSetIdMap[config.SetID]) return configMap

    const { SetID, RequireNum } = config
    if (!configMap[SetID])
      configMap[SetID] = {} as Record<RelicSetCountKey, RelicSetSkillConfig>
    configMap[SetID][RequireNum] = config
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
