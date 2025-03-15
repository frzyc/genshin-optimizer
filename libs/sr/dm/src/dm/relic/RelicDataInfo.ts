import type { RelicSetId, RelicSlotDMKey } from '../../mapping/relic'
import { readDMJSON } from '../../util'

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

const relicDataInfoSrc = JSON.parse(
  readDMJSON('ExcelOutput/RelicDataInfo.json'),
) as RelicDataInfo[]

export const relicDataInfo = relicDataInfoSrc.reduce(
  (fullInfo, info) => {
    const { SetID, Type } = info
    if (!fullInfo[SetID])
      fullInfo[SetID] = {} as Partial<Record<RelicSlotDMKey, RelicDataInfo>>
    fullInfo[SetID][Type] = info
    return fullInfo
  },
  {} as Record<RelicSetId, Partial<Record<RelicSlotDMKey, RelicDataInfo>>>,
)
