import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { objFilterKeys, objMap } from '@genshin-optimizer/common/util'
import { PROJROOT_PATH } from '../../consts'
import type { StatDMKey } from '../../mapping'
import type { RelicSetId } from '../../mapping/relic'
import { relicSetIdMap } from '../../mapping/relic'
import { readDMJSON } from '../../util'
import type { Value } from '../common'

export type RelicSetSkillConfig = {
  SetID: number
  RequireNum: number
  SkillDesc: string
  PropertyList: Property[]
  AbilityName: string
  AbilityParamList: Value[]
}
// TODO: update these once Dim updates the datamine
type Property = {
  PBIJEBOGCKM: StatDMKey // PropertyName
  AMMAAKPAKAA: Value // Value
}

const relicSetSkillConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/RelicSetSkillConfig.json')
) as Record<string, Record<string, RelicSetSkillConfig>>

export const relicSetSkillConfig = objFilterKeys(
  relicSetSkillConfigSrc,
  Object.keys(relicSetIdMap) as RelicSetId[]
) as Record<RelicSetId, Record<string, RelicSetSkillConfig>>

const prePath = `${PROJROOT_PATH}/src/dm/relic/RelicSetSkillConfig`

export const relicSetSkillConfig_bySet = objMap(
  relicSetSkillConfig,
  (setNumConfig) => Object.values(setNumConfig)
)

dumpFile(`${prePath}_bySet_gen.json`, relicSetSkillConfig_bySet)
