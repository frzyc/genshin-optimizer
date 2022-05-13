import { PropTypeKey, propTypeMap } from "../.."

type AvatarPromoteExcelConfigData = {
  "avatarPromoteId": number//2,
  "promoteAudio": number//1,
  "promoteLevel": string//"",
  "scoinCost"?: number//20000,
  "costItems": Array<{
    "id": number//104161,
    "count": number//1
  }>
  // [
  //   {
  //     "id": number//104161,
  //     "count": number//1
  //   },
  //   {},
  //   {
  //     "id": number//100055,
  //     "count": number//3
  //   },
  //   {
  //     "id": number//112008,
  //     "count": number//3
  //   }
  // ],
  "unlockMaxLevel": number//40,
  "addProps": Array<{
    "propType": PropTypeKey// "FIGHT_PROP_BASE_HP",
    "value": number//858.2550048828125
  }>
  // [
  //   {
  //     "PropType": PropTypeKey// "FIGHT_PROP_BASE_HP",
  //     "Value": number//858.2550048828125
  //   },
  //   {
  //     "PropType": PropTypeKey//"FIGHT_PROP_BASE_DEFENSE",
  //     "Value": number//52.32600021362305
  //   },
  //   {
  //     "PropType": PropTypeKey// "FIGHT_PROP_BASE_ATTACK",
  //     "Value": number//22.82823371887207
  //   },
  //   {
  //     "PropType": PropTypeKey// "FIGHT_PROP_CRITICAL_HURT"
  //     "Value": number
  //   }
  // ],
  "requiredPlayerLevel": number// 15
}
const ascensionSrc = require('../../GenshinData/ExcelBinOutput/AvatarPromoteExcelConfigData.json') as AvatarPromoteExcelConfigData[]
export type AscensionData = {
  [AvatarPromoteId: number]: {
    props: { [key: string]: number }
  }[]
}
const ascensionData = {} as AscensionData
ascensionSrc.forEach(asc => {
  const { avatarPromoteId, promoteLevel = 0, addProps } = asc
  if (!ascensionData[avatarPromoteId]) ascensionData[avatarPromoteId] = []
  ascensionData[avatarPromoteId][promoteLevel] = {
    props: Object.fromEntries(addProps.map(({ propType, value = 0 }) =>
      [propTypeMap[propType], value]))
  }
})

export default ascensionData;
