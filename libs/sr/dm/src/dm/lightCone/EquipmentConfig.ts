import { dumpFile } from '@genshin-optimizer/common/pipeline'
import {
  nameToKey,
  objFilterKeys,
  objKeyValMap,
} from '@genshin-optimizer/common/util'
import { parse } from 'json-bigint'
import { TextMapEN } from '../../TextMapUtil'
import { PROJROOT_PATH } from '../../consts'
import type { LightConeId } from '../../mapping/lightCone'
import { lightConeIdMap } from '../../mapping/lightCone'
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

const equipmentConfigSrc = parse(
  readDMJSON('ExcelOutput/EquipmentConfig.json')
) as EquipmentConfig[]

dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/EquipmentConfig_idmap_gen.json`,
  objKeyValMap(equipmentConfigSrc, (config) => [
    config.EquipmentID,
    nameToKey(TextMapEN[config.EquipmentName.Hash.toString()]),
  ])
)
dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/EquipmentConfig_keys_gen.json`,
  [
    ...new Set(
      Object.entries(equipmentConfigSrc).map(([, data]) =>
        nameToKey(TextMapEN[data.EquipmentName.Hash.toString()])
      )
    ),
  ]
    .filter((s) => s && s !== 'NICKNAME')
    .sort()
)

const equipmentConfig = objFilterKeys(
  objKeyValMap(equipmentConfigSrc, (config) => [config.EquipmentID, config]),
  Object.keys(lightConeIdMap) as LightConeId[]
) as Record<LightConeId, EquipmentConfig>
export { equipmentConfig }
