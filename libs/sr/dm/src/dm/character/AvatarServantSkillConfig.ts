import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { parse } from 'json-bigint'
import { PROJROOT_PATH } from '../../consts'
import { readDMJSON } from '../../util'
import type { HashId, Value } from '../common'
import type {
  AttackType,
  SkillEffect,
  StanceDamageType,
} from './AvatarSkillConfig'

export type AvatarServantSkillConfig = {
  SkillID: number
  SkillName: HashId
  SkillTag: HashId
  SkillTypeDesc: HashId
  Level: number
  MaxLevel: number
  SkillTriggerKey: string
  SkillIcon: string
  UltraSkillIcon: string
  SkillDesc: HashId
  SimpleSkillDesc: HashId
  RatedSkillTreeID: number[]
  RatedRankID: number[]
  ExtraEffectIDList: number[]
  SimpleExtraEffectIDList: number[]
  ShowStanceList: Value[]
  StanceDamageDisplay: number
  SPBase: Value
  SPMultipleRatio: Value
  BPNeed: Value
  DelayRatio: Value
  ParamList: Value[]
  SimpleParamList: Value[]
  StanceDamageType: StanceDamageType
  AttackType?: AttackType
  SkillEffect: SkillEffect
}

const avatarServantSkillConfigSrc = parse(
  readDMJSON('ExcelOutput/AvatarServantSkillConfig.json')
) as AvatarServantSkillConfig[]

const avatarServantSkillConfig = {} as Record<
  string,
  AvatarServantSkillConfig[]
>
avatarServantSkillConfigSrc.forEach((config) => {
  if (!avatarServantSkillConfig[config.SkillID])
    avatarServantSkillConfig[config.SkillID] = []
  avatarServantSkillConfig[config.SkillID].push(config)
})

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarServantSkillConfig_gen.json`,
  avatarServantSkillConfig
)

export { avatarServantSkillConfig }
