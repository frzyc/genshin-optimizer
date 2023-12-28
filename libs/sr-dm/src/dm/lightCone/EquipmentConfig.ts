import { dumpFile, nameToKey } from '@genshin-optimizer/pipeline'
import { objFilterKeys } from '@genshin-optimizer/util'
import { PROJROOT_PATH } from '../../consts'
import type { LightConeId } from '../../mapping/lightCone'
import { lightConeIdMap } from '../../mapping/lightCone'
import { TextMapEN } from '../../TextMapUtil'
import { readDMJSON } from '../../util'
import type { HashId } from '../common'

export type EquipmentConfig = {
  EquipmentID: number
  Release?: boolean
  EquipmentName: HashId
  EquipmentDesc: HashId
  Rarity: Rarity
  AvatarBaseType: AvatarBaseType
  MaxPromotion: number
  MaxRank: number
  ExpType: number
  SkillID: number
  ExpProvide: number
  CoinCost: number
  RankUpCostList: number[]
  ThumbnailPath: string
  ImagePath: string
  ItemRightPanelOffset: number[]
  AvatarDetailOffset: number[]
  BattleDialogOffset: number[]
  GachaResultOffset: number[]
}

type AvatarBaseType =
  | 'Rogue'
  | 'Priest'
  | 'Warrior'
  | 'Knight'
  | 'Warlock'
  | 'Shaman'
  | 'Mage'

type Rarity =
  | 'CombatPowerLightconeRarity3'
  | 'CombatPowerLightconeRarity4'
  | 'CombatPowerLightconeRarity5'

const equipmentConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/EquipmentConfig.json')
) as Record<string, EquipmentConfig>

dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/EquipmentConfig_idmap_gen.json`,
  Object.fromEntries(
    Object.entries(equipmentConfigSrc).map(([avatarId, data]) => [
      avatarId,
      nameToKey(TextMapEN[data.EquipmentName.Hash]),
    ])
  )
)
dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/EquipmentConfig_keys_gen.json`,
  [
    ...new Set(
      Object.entries(equipmentConfigSrc).map(([, data]) =>
        nameToKey(TextMapEN[data.EquipmentName.Hash])
      )
    ),
  ]
    .filter((s) => s && s !== 'NICKNAME')
    .sort()
)

const equipmentConfig = objFilterKeys(
  equipmentConfigSrc,
  Object.keys(lightConeIdMap) as LightConeId[]
) as Record<LightConeId, EquipmentConfig>
export { equipmentConfig }
