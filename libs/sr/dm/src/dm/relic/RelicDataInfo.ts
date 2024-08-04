import { objKeyValMap } from '@genshin-optimizer/common/util'
import type { RelicSlotDMKey } from '../../mapping/relic'
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
  readDMJSON('ExcelOutput/RelicDataInfo.json')
) as RelicDataInfo[]

export const relicDataInfo = objKeyValMap(relicDataInfoSrc, (dataInfo) => [
  dataInfo.SetID,
  dataInfo,
])
