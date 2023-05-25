import { readDMJSON } from '../../util'

type FetterCharacterCardExcelConfigData = {
  avatarId: number //10000034,
  fetterLevel: number //10,
  rewardId: number //241012 look up in ExcelBinOutput\RewardExcelConfigData.json
}

const fetterCharacterCardExcelConfigDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/FetterCharacterCardExcelConfigData.json')
) as FetterCharacterCardExcelConfigData[]
//character data
const fetterCharacterCardExcelConfigData = Object.fromEntries(
  fetterCharacterCardExcelConfigDataSrc.map((data) => [data.avatarId, data])
) as { [avatarId: number]: FetterCharacterCardExcelConfigData }

export { fetterCharacterCardExcelConfigData }
