import { dumpFile } from '@genshin-optimizer/common/pipeline'
import {
  nameToKey,
  objFilterKeys,
  objKeyValMap,
} from '@genshin-optimizer/common/util'
import { TextMapEN } from '../../TextMapUtil'
import { PROJROOT_PATH } from '../../consts'
import type { LightConeId } from '../../mapping/lightCone'
import { lightConeIdMap } from '../../mapping/lightCone'
import { readDMJSON } from '../../util'
import type { HashId } from '../common'

export type ItemConfigEquipment = {
  ID: number
  ItemMainType: ItemType
  ItemSubType: ItemType
  InventoryDisplayTag: number
  Rarity: Rarity
  isVisible: boolean
  ItemName: HashId
  ItemDesc: HashId
  ItemBGDesc: HashId
  ItemIconPath: string
  ItemFigureIconPath: string
  ItemCurrencyIconPath: string
  ItemAvatarIconPath: string
  PileLimit: number
  CustomDataList: any[]
  IsSellable?: boolean
  ReturnItemIDList: ReturnItemIDList[]
}

type ItemType = 'Equipment'

type Rarity = 'Rare' | 'VeryRare' | 'SuperRare'

type ReturnItemIDList = {
  ItemID: number
  ItemNum: number
}

const ItemConfigEquipmentSrc = JSON.parse(
  readDMJSON('ExcelOutput/ItemConfigEquipment.json')
) as ItemConfigEquipment[]

dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/ItemConfigEquipment_idmap_gen.json`,
  objKeyValMap(ItemConfigEquipmentSrc, (config) => [
    config.ID,
    nameToKey(TextMapEN[config.ItemName.Hash]),
  ])
)
dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/ItemConfigEquipment_keys_gen.json`,
  [
    ...new Set(
      ItemConfigEquipmentSrc.map((data) =>
        nameToKey(TextMapEN[data.ItemName.Hash])
      )
    ),
  ]
    .filter((s) => s && s !== 'NICKNAME')
    .sort()
)

const ItemConfigEquipment = objFilterKeys(
  objKeyValMap(ItemConfigEquipmentSrc, (config) => [config.ID, config]),
  Object.keys(lightConeIdMap) as LightConeId[]
) as Record<LightConeId, ItemConfigEquipment>
export { ItemConfigEquipment }
