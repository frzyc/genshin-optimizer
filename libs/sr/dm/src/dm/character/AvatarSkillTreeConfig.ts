import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { parse } from 'json-bigint'
import { PROJROOT_PATH } from '../../consts'
import type { AvatarId } from '../../mapping'
import { characterIdMap } from '../../mapping'
import { readDMJSON } from '../../util'
import type { HashId, MaterialValue, Value } from '../common'

export type AvatarSkillTreeConfig = {
  PointID: number
  Level: number
  AvatarID: number
  PointType: number
  Anchor: Anchor
  MaxLevel: number
  DefaultUnlock?: boolean
  PrePoint: number[]
  StatusAddList: StatusAddList[]
  MaterialList: MaterialValue[]
  LevelUpSkillID: number[]
  IconPath: string
  PointName: string
  PointDesc: string
  AbilityName: string
  PointTriggerKey: HashId
  ParamList: Value[]
  AvatarPromotionLimit?: number
  AvatarLevelLimit?: number
}

export type Anchor =
  | 'Point01'
  | 'Point02'
  | 'Point03'
  | 'Point04'
  | 'Point05'
  | 'Point06'
  | 'Point07'
  | 'Point08'
  | 'Point09'
  | 'Point10'
  | 'Point11'
  | 'Point12'
  | 'Point13'
  | 'Point14'
  | 'Point15'
  | 'Point16'
  | 'Point17'
  | 'Point18'

export type StatusAddList = {
  PropertyType: PropertyType
  Value: Value
}

export type PropertyType =
  | 'IceAddedRatio'
  | 'DefenceAddedRatio'
  | 'StatusResistanceBase'
  | 'WindAddedRatio'
  | 'AttackAddedRatio'
  | 'FireAddedRatio'
  | 'ImaginaryAddedRatio'
  | 'BreakDamageAddedRatioBase'
  | 'HPAddedRatio'
  | 'StatusProbabilityBase'
  | 'QuantumAddedRatio'
  | 'CriticalChanceBase'
  | 'CriticalDamageBase'
  | 'PhysicalAddedRatio'
  | 'ThunderAddedRatio'

export const allAvatarSkillTreeTypes = [
  'basic',
  'skill',
  'ult',
  'talent',
  'technique',
  'bonusAbility1',
  'bonusAbility2',
  'bonusAbility3',
  'statBoost1',
  'statBoost2',
  'statBoost3',
  'statBoost4',
  'statBoost5',
  'statBoost6',
  'statBoost7',
  'statBoost8',
  'statBoost9',
  'statBoost10',
] as const
export const allServantSkillTreeTypes = [
  'servantSkill',
  'servantTalent',
] as const
export const allSkillTreeTypes = [
  ...allAvatarSkillTreeTypes,
  ...allServantSkillTreeTypes,
] as const
export type AvatarSkillTreeType = (typeof allAvatarSkillTreeTypes)[number]
export type ServantSkillTreeType = (typeof allServantSkillTreeTypes)[number]
export type SkillTreeType = (typeof allSkillTreeTypes)[number]

const avatarSkillTreeConfigSrc = parse(
  readDMJSON('ExcelOutput/AvatarSkillTreeConfig.json'),
) as AvatarSkillTreeConfig[]

const avatarSkillTreeConfig = objKeyMap(
  Object.keys(characterIdMap) as AvatarId[],
  (avatarId) => {
    const data = {} as Record<string, AvatarSkillTreeConfig[]>
    avatarSkillTreeConfigSrc.forEach((skill) => {
      if (skill.AvatarID.toString() === avatarId) {
        if (!data[skill.PointID]) data[skill.PointID] = []
        data[skill.PointID].push(skill)
      }
    })
    return data
  },
) as Record<AvatarId, Record<string, AvatarSkillTreeConfig[]>>

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarSkillTreeConfig_gen.json`,
  avatarSkillTreeConfig,
)

export { avatarSkillTreeConfig }
