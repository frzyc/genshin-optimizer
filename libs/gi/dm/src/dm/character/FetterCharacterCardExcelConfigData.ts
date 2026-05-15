import type { CharacterId } from '../../mapping'
import { readDMJSON } from '../../util'

type FetterCharacterCardExcelConfigData = {
  avatarId: number //10000034,
  fetterLevel: number //10 or 6,
  rewardId: number //241012 look up in ExcelBinOutput\RewardExcelConfigData.json
}

const fetterCharacterCardExcelConfigDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/FetterCharacterCardExcelConfigData.json')
) as FetterCharacterCardExcelConfigData[]
//character data
const fetterCharacterCardExcelConfigData = Object.fromEntries(
  fetterCharacterCardExcelConfigDataSrc.map((data) =>
    // Might need to be expanded if we want the rewards at level 6
    data.fetterLevel === 10 ? [data.avatarId, data] : []
  )
) as Record<CharacterId, FetterCharacterCardExcelConfigData>

export { fetterCharacterCardExcelConfigData }
