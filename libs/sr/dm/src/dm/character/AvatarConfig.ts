import { dumpFile } from '@genshin-optimizer/common/pipeline'
import {
  nameToKey,
  objFilterKeys,
  objKeyValMap,
} from '@genshin-optimizer/common/util'
import { TextMapEN } from '../../TextMapUtil'
import { PROJROOT_PATH } from '../../consts'
import type { AvatarBaseTypeKey, AvatarId } from '../../mapping'
import { characterIdMap } from '../../mapping'
import { readDMJSON } from '../../util'
import type { HashId, MaterialValue, Value } from '../common'

export type AvatarConfig = {
  AvatarID: AvatarId
  AvatarName: HashId
  AvatarFullName: HashId
  AdventurePlayerID: number
  AvatarVOTag: string
  Rarity: AvatarRarity
  JsonPath: string
  DamageType: AvatarDamageType
  SPNeed: Value
  ExpGroup: number
  MaxPromotion: number
  MaxRank?: number
  RankIDList: number[]
  RewardList: MaterialValue[]
  RewardListMax: MaterialValue[]
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

export type AvatarDamageType =
  | 'Physical'
  | 'Quantum'
  | 'Thunder'
  | 'Ice'
  | 'Wind'
  | 'Fire'
  | 'Imaginary'

const avatarConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/AvatarConfig.json')
) as AvatarConfig[]

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
      avatarConfigSrc.map((config) =>
        nameToKey(TextMapEN[config.AvatarName.Hash])
      )
    ),
  ]
    .filter((s) => s)
    .sort()
)

const avatarConfig = objFilterKeys(
  objKeyValMap(avatarConfigSrc, (config) => [config.AvatarID, config]),
  Object.keys(characterIdMap) as AvatarId[]
) as Record<AvatarId, AvatarConfig>
export { avatarConfig }
