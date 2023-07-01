import { dumpFile } from '@genshin-optimizer/pipeline'
import { objMap } from '@genshin-optimizer/util'
import { PROJROOT_PATH } from '../../consts'
import { readDMJSON } from '../../util'
import type { HashId, Value } from '../common'

export type AvatarSkillConfig = {
  SkillID: number
  SkillName: HashId
  SkillTag: HashId
  SkillTypeDesc: HashId
  Level: number
  MaxLevel: number
  SkillTriggerKey: SkillTriggerKey
  SkillIcon: string
  UltraSkillIcon: UltraSkillIcon
  LevelUpCostList: any[]
  SkillDesc: HashId
  SimpleSkillDesc: HashId
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

export type UltraSkillIcon =
  | ''
  | 'SpriteOutput/SkillIcons/1001/SkillIcon_1001_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1002/SkillIcon_1002_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1003/SkillIcon_1003_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1004/SkillIcon_1004_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1005/SkillIcon_1005_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1006/SkillIcon_1006_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1008/SkillIcon_1008_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1009/SkillIcon_1009_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1013/SkillIcon_1013_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1101/SkillIcon_1101_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1102/SkillIcon_1102_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1103/SkillIcon_1103_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1104/SkillIcon_1104_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1105/SkillIcon_1105_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1106/SkillIcon_1106_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1107/SkillIcon_1107_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1108/SkillIcon_1108_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1109/SkillIcon_1109_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1201/SkillIcon_1201_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1202/SkillIcon_1202_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1203/SkillIcon_1203_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1204/SkillIcon_1204_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1206/SkillIcon_1206_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1207/SkillIcon_1207_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1209/SkillIcon_1209_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/1211/SkillIcon_1211_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/8001/SkillIcon_8001_Ultra_on.png'
  | 'SpriteOutput/SkillIcons/8001/SkillIcon_8001_Normal02.png'
  | 'SpriteOutput/SkillIcons/8001/SkillIcon_8001_BP02.png'
  | 'SpriteOutput/SkillIcons/8003/SkillIcon_8003_Ultra_on.png'

const avatarSkillConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/AvatarSkillConfig.json')
) as Record<string, Record<string, AvatarSkillConfig>>

const avatarSkillConfig = objMap(avatarSkillConfigSrc, (v) => Object.values(v))

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/avatarSkillConfig_gen.json`,
  avatarSkillConfig
)

export { avatarSkillConfig }
