import { dumpFile } from '@genshin-optimizer/pipeline'
import { objKeyMap } from '@genshin-optimizer/util'
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

const avatarSkillTreeConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/AvatarSkillTreeConfig.json')
) as Record<string, Record<string, AvatarSkillTreeConfig>>

const avatarSkillTreeConfig = objKeyMap(
  Object.keys(characterIdMap) as AvatarId[],
  (avatarId) => {
    const data = {} as Record<string, AvatarSkillTreeConfig[]>
    for (const value of Object.values(avatarSkillTreeConfigSrc)) {
      const skillArr = Object.values(value)
      if (skillArr[0].AvatarID.toString() === avatarId)
        data[skillArr[0].PointID] = skillArr
    }
    return data
  }
) as Record<AvatarId, Record<string, AvatarSkillTreeConfig[]>>

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarSkillTreeConfig_gen.json`,
  avatarSkillTreeConfig
)

export { avatarSkillTreeConfig }
