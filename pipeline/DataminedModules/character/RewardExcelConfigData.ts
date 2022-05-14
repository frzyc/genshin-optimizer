
type RewardExcelConfigData = {
  "rewardId": number//241012,
  "rewardItemList": {
    "itemId": number// 210014, //MaterialExcelConfigData
    "itemCount": number//1
  }[]
}

const rewardExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/RewardExcelConfigData.json') as RewardExcelConfigData[]
//character data
const rewardExcelConfigData = Object.fromEntries(rewardExcelConfigDataSrc.map(data =>
  [data.rewardId, data])) as { [rewardId: number]: RewardExcelConfigData }

export default rewardExcelConfigData
