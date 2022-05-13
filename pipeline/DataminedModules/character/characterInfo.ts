import { CharacterId } from "../.."

type FetterInfoExcelConfigData = {
  "infoBirthMonth": number//3,
  "infoBirthDay": number//21,
  "avatarNativeTextMapHash": number//3006274177,
  "avatarVisionBeforTextMapHash": number//3929787020,
  "avatarConstellationBeforTextMapHash": number//808906466,
  "avatarTitleTextMapHash": number//2339950258,
  "avatarDetailTextMapHash": number//2464288834,
  "avatarAssocType": string//"ASSOC_TYPE_MONDSTADT",
  "cvChineseTextMapHash": number//4257440758,
  "cvJapaneseTextMapHash": number//2464221280,
  "cvEnglishTextMapHash": number//3349029444,
  "cvKoreanTextMapHash": number//2318572807,
  "avatarVisionAfterTextMapHash": number//3710640289,
  "avatarConstellationAfterTextMapHash": number//1057268155,
  "fetterId": number//122,
  "avatarId": CharacterId//10000034,
  "openConds": any[]//[],
  "finishConds": object[]
  // [
  //   {
  //     "condType": "FETTER_COND_NOT_OPEN",
  //     "paramList": []
  //   }
  // ]
}
const characterInfoSrc = require('../../GenshinData/ExcelBinOutput/FetterInfoExcelConfigData.json') as FetterInfoExcelConfigData[]

const characterInfo = Object.fromEntries(characterInfoSrc.map(data =>
  [data.avatarId, data])) as Record<CharacterId, FetterInfoExcelConfigData>

export default characterInfo
