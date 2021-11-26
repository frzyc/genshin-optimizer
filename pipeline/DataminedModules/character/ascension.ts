import { PropTypeKey, propTypeMap } from "../.."

type AvatarPromoteExcelConfigData = {
  "AvatarPromoteId": number//2,
  "PromoteLevel": number//1,
  "PromoteAudio": string//"",
  "ScoinCost": number//20000,
  "CostItems": [
    {
      "Id": number//104161,
      "Count": number//1
    },
    {},
    {
      "Id": number//100055,
      "Count": number//3
    },
    {
      "Id": number//112008,
      "Count": number//3
    }
  ],
  "UnlockMaxLevel": number//40,
  "AddProps": [
    {
      "PropType": PropTypeKey// "FIGHT_PROP_BASE_HP",
      "Value": number//858.2550048828125
    },
    {
      "PropType": PropTypeKey//"FIGHT_PROP_BASE_DEFENSE",
      "Value": number//52.32600021362305
    },
    {
      "PropType": PropTypeKey// "FIGHT_PROP_BASE_ATTACK",
      "Value": number//22.82823371887207
    },
    {
      "PropType": PropTypeKey// "FIGHT_PROP_CRITICAL_HURT"
      "Value": number
    }
  ],
  "RequiredPlayerLevel": number// 15
}
const ascensionSrc = require('../../GenshinData/ExcelBinOutput/AvatarPromoteExcelConfigData.json') as AvatarPromoteExcelConfigData[]
export type AscensionData = {
  [AvatarPromoteId: number]: {
    props: { [key: string]: number }
  }[]
}
const ascensionData = {} as AscensionData
ascensionSrc.forEach(asc => {
  const { AvatarPromoteId, PromoteLevel = 0, AddProps } = asc
  if (!ascensionData[AvatarPromoteId]) ascensionData[AvatarPromoteId] = []
  ascensionData[AvatarPromoteId][PromoteLevel] = {
    props: Object.fromEntries(AddProps.map(({ PropType, Value = 0 }) =>
      [propTypeMap[PropType], Value]))
  }
})

export default ascensionData;