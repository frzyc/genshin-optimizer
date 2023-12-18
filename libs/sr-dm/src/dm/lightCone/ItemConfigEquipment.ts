import { dumpFile, nameToKey } from '@genshin-optimizer/pipeline'
import { objFilterKeys } from '@genshin-optimizer/util'
import { PROJROOT_PATH } from '../../consts'
import type { LightConeId } from '../../mapping/lightCone'
import { lightConeIdMap } from '../../mapping/lightCone'
import { TextMapEN } from '../../TextMapUtil'
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
) as Record<string, ItemConfigEquipment>

dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/ItemConfigEquipment_idmap_gen.json`,
  Object.fromEntries(
    Object.entries(ItemConfigEquipmentSrc).map(([avatarId, data]) => [
      avatarId,
      nameToKey(TextMapEN[data.ItemName.Hash]),
    ])
  )
)
dumpFile(
  `${PROJROOT_PATH}/src/dm/lightCone/ItemConfigEquipment_keys_gen.json`,
  [
    ...new Set(
      Object.entries(ItemConfigEquipmentSrc).map(([, data]) =>
        nameToKey(TextMapEN[data.ItemName.Hash])
      )
    ),
  ]
    .filter((s) => s && s !== 'NICKNAME')
    .sort()
)

const ItemConfigEquipment = objFilterKeys(
  ItemConfigEquipmentSrc,
  Object.keys(lightConeIdMap) as LightConeId[]
) as Record<LightConeId, ItemConfigEquipment>
export { ItemConfigEquipment }
