import { dumpFile, nameToKey } from '@genshin-optimizer/pipeline'
import { PROJROOT_PATH } from '../../consts'
import type { AvatarBaseTypeKey, AvatarId } from '../../mapping'
import { characterIdMap } from '../../mapping'
import { TextMapEN } from '../../TextMapUtil'
import { readDMJSON } from '../../util'
import type { DamageTypeKey, PathKey } from '@genshin-optimizer/sr-consts'
import { HashId } from '../common'
import { objFilterKeys } from '@genshin-optimizer/util'

export type AvatarConfig = {
  AvatarID: AvatarId
  AvatarName: HashId
  AvatarFullName: HashId
  AdventurePlayerID: number
  AvatarVOTag: string
  Rarity: AvatarRarity
  JsonPath: string
  DamageType: DamageTypeKey
  SPNeed: SPNeed
  ExpGroup: number
  MaxPromotion: number
  MaxRank?: number
  RankIDList: number[]
  RewardList: RewardList[]
  RewardListMax: RewardList[]
  SkillList: number[]
  AvatarBaseType: AvatarBaseTypeKey
  DefaultAvatarModelPath: string
  DefaultAvatarHeadIconPath: string
  AvatarSideIconPath: string
  AvatarMiniIconPath: string
  ActionAvatarHeadIconPath: string
  UltraSkillCutInPrefabPath: string
  UIAvatarModelPath: string
  ManikinJsonPath: string
  AvatarDesc: HashId
  AIPath: AIPath
  SkilltreePrefabPath: string
  DamageTypeResistance: any[]
  Release: boolean
  SideAvatarHeadIconPath: string
  WaitingAvatarHeadIconPath: string
  AvatarCutinImgPath: string
  AvatarCutinBgImgPath: string
  AvatarCutinFrontImgPath: string
  AvatarCutinIntroText: HashId
  GachaResultOffset: number[]
  AvatarDropOffset: number[]
  AvatarTrialOffset: number[]
  PlayerCardOffset: number[]
  AssistOffset: number[]
  AssistBgOffset: number[]
  AvatarSelfShowOffset: number[]
}

export type AIPath = 'Config/ConfigAI/Avatar_ComplexSkilll_AutoFight_AI.json'

export type AvatarRarity =
  | 'CombatPowerAvatarRarityType4'
  | 'CombatPowerAvatarRarityType5'

export type RewardList = {
  ItemID: number
  ItemNum: number
}

export type SPNeed = {
  Value: number
}

const avatarConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/AvatarConfig.json')
) as Record<string, AvatarConfig>

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarConfig_idmap_gen.json`,
  Object.fromEntries(
    Object.entries(avatarConfigSrc).map(([avatarId, data]) => [
      avatarId,
      nameToKey(TextMapEN[data.AvatarName.Hash]),
    ])
  )
)
dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarConfig_CharacterKey_gen.json`,
  [
    ...new Set(
      Object.entries(avatarConfigSrc).map(([, data]) =>
        nameToKey(TextMapEN[data.AvatarName.Hash])
      )
    ),
  ]
    .filter((s) => s && s !== 'NICKNAME')
    .sort()
)

const avatarConfig = objFilterKeys(
  avatarConfigSrc,
  Object.keys(characterIdMap) as AvatarId[]
) as Record<AvatarId, AvatarConfig>
export { avatarConfig }
