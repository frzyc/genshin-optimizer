import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type { AbilityKey } from '@genshin-optimizer/sr/consts'
import { parse } from 'json-bigint'
import { PROJROOT_PATH } from '../../consts'
import { readDMJSON } from '../../util'
import type { HashId, Value } from '../common'

export type AvatarSkillConfig = {
  SkillID: number
  SkillName: HashId // Frigid Cold Arrow
  SkillTag: HashId // Single Target
  SkillTypeDesc: HashId // Basic ATK
  Level: number
  MaxLevel: number
  SkillTriggerKey: SkillTriggerKey
  SkillIcon: string
  UltraSkillIcon: string
  LevelUpCostList: any[]
  SkillDesc?: HashId // Deals Ice DMG equal to 100% of March 7th's ATK to a single enemy.
  SimpleSkillDesc?: HashId // Deals minor Ice DMG to a single enemy.
  RatedSkillTreeID: number[]
  RatedRankID: number[]
  ExtraEffectIDList: number[]
  SimpleExtraEffectIDList: number[]
  ShowStanceList: Value[]
  ShowDamageList: any[]
  ShowHealList: any[]
  InitCoolDown: number
  CoolDown: number
  SPBase?: Value
  SPMultipleRatio: Value
  BPNeed?: Value
  BPAdd?: Value
  SkillNeed: HashId
  DelayRatio: Value
  ParamList: Value[]
  SimpleParamList: Value[]
  StanceDamageType?: StanceDamageType
  AttackType?: AttackType
  SkillEffect: SkillEffect
  SkillComboValueDelta?: Value
  SPNeed?: Value
}

export type AttackType = 'Normal' | 'BPSkill' | 'Ultra' | 'MazeNormal' | 'Maze'
export const DmAttackTypeMap: Record<AttackType, AbilityKey> = {
  Normal: 'basic',
  BPSkill: 'skill',
  Ultra: 'ult',
  MazeNormal: 'overworld',
  Maze: 'technique',
}

export type SkillEffect =
  | 'SingleAttack'
  | 'Defence'
  | 'AoEAttack'
  | 'MazeAttack'
  | 'Enhance'
  | 'Blast'
  | 'Impair'
  | 'Bounce'
  | 'Support'
  | 'Restore'

export type SkillTriggerKey =
  | 'Skill01'
  | 'Skill02'
  | 'Skill03'
  | 'SkillP01'
  | ''
  | 'SkillMaze'
  | 'Skill21'
  | 'Skill11'

export type StanceDamageType =
  | 'Ice'
  | 'Wind'
  | 'Fire'
  | 'Imaginary'
  | 'Thunder'
  | 'Quantum'
  | 'Physical'

const avatarSkillConfigSrc = parse(
  readDMJSON('ExcelOutput/AvatarSkillConfig.json')
) as AvatarSkillConfig[]

const avatarSkillConfig = {} as Record<string, AvatarSkillConfig[]>
avatarSkillConfigSrc.forEach((config) => {
  if (!avatarSkillConfig[config.SkillID]) avatarSkillConfig[config.SkillID] = []
  avatarSkillConfig[config.SkillID].push(config)
})

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/avatarSkillConfig_gen.json`,
  avatarSkillConfig
)

export { avatarSkillConfig }
