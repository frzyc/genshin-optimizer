import type { RelicSetId, RelicSlotDMKey } from '../../mapping/relic'
import { readDMJSON } from '../../util'

export type RelicDataInfoSrc = Partial<Record<RelicSlotDMKey, RelicDataInfo>>

export type RelicDataInfo = {
  SetID: number
  Type: RelicSlotDMKey
  IconPath: string
  ItemFigureIconPath: string
  RelicName: string
  ItemBGDesc: string
  BGStoryTitle: string
  BGStoryContent: string
}

export const relicDataInfo = JSON.parse(
  readDMJSON('ExcelOutput/RelicDataInfo.json')
) as Record<RelicSetId, RelicDataInfoSrc>
