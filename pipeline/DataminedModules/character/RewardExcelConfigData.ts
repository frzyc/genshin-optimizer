
type RewardExcelConfigData = {
  "RewardId": number//241012,
  "RewardItemList": Array<{
    "ItemId": number// 210014, //MaterialExcelConfigData
    "ItemCount": number//1
  }>
}

const rewardExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/RewardExcelConfigData.json') as RewardExcelConfigData[]
//character data
const rewardExcelConfigData = Object.fromEntries(rewardExcelConfigDataSrc.map(data =>
  [data.RewardId, data])) as { [RewardId: number]: RewardExcelConfigData }

export default rewardExcelConfigData