import { dumpFile } from '@genshin-optimizer/common/pipeline'
import {
  nameToKey,
  objFilterKeys,
  objKeyValMap,
} from '@genshin-optimizer/common/util'
import { parse } from 'json-bigint'
import { TextMapEN } from '../../TextMapUtil'
import { PROJROOT_PATH } from '../../consts'
import type { ServantId } from '../../mapping'
import { servantIdMap } from '../../mapping'
import { readDMJSON } from '../../util'
import type { HashId, Value } from '../common'

export type AvatarServantConfig = {
  ServantID: number
  ServantName: HashId
  HeadIcon: string
  UnCreateHeadIconPath: string
  WaitingServantHeadIconPath: string
  ActionServantHeadIconPath: string
  ServantSideIconPath: string
  ServantMiniIconPath: string
  Config: string
  Prefab: string
  ManikinJsonPath: string
  UIServantModelPath: string
  SkillIDList: number[]
  HPBase: string
  HPInherit: string
  HPSkill: number
  SpeedBase: string
  SpeedInherit: string
  SpeedSkill: number
  Aggro: Value
}

const avatarServantConfigSrc = parse(
  readDMJSON('ExcelOutput/AvatarServantConfig.json')
) as AvatarServantConfig[]

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarServantConfig_idmap_gen.json`,
  Object.fromEntries(
    Object.values(avatarServantConfigSrc).map((data) => [
      data.ServantID,
      nameToKey(TextMapEN[data.ServantName.Hash.toString()]),
    ])
  )
)
dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarServantConfig_CharacterKey_gen.json`,
  [
    ...new Set(
      avatarServantConfigSrc.map((config) =>
        nameToKey(TextMapEN[config.ServantName.Hash.toString()])
      )
    ),
  ]
    .filter((s) => s)
    .sort()
)

const avatarServantConfig = objFilterKeys(
  objKeyValMap(avatarServantConfigSrc, (config) => [config.ServantID, config]),
  Object.keys(servantIdMap) as ServantId[]
) as Record<ServantId, AvatarServantConfig>
export { avatarServantConfig }
