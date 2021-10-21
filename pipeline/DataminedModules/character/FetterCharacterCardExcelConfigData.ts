
type FetterCharacterCardExcelConfigData = {
  "AvatarId": number//10000034,
  "FetterLevel": number//10,
  "RewardId": number//241012 look up in ExcelBinOutput\RewardExcelConfigData.json
}

const fetterCharacterCardExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/FetterCharacterCardExcelConfigData.json') as FetterCharacterCardExcelConfigData[]
//character data
const fetterCharacterCardExcelConfigData = Object.fromEntries(fetterCharacterCardExcelConfigDataSrc.map(data =>
  [data.AvatarId, data])) as { [AvatarId: number]: FetterCharacterCardExcelConfigData }

export default fetterCharacterCardExcelConfigData