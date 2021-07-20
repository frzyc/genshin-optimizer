import { CharacterId } from "../.."

type FetterInfoExcelConfigData = {
  "InfoBirthMonth": number//3,
  "InfoBirthDay": number//21,
  "AvatarNativeTextMapHash": number//3006274177,
  "AvatarVisionBeforTextMapHash": number//3929787020,
  "AvatarConstellationBeforTextMapHash": number//808906466,
  "AvatarTitleTextMapHash": number//2339950258,
  "AvatarDetailTextMapHash": number//2464288834,
  "AvatarAssocType": string//"ASSOC_TYPE_MONDSTADT",
  "CvChineseTextMapHash": number//4257440758,
  "CvJapaneseTextMapHash": number//2464221280,
  "CvEnglishTextMapHash": number//3349029444,
  "CvKoreanTextMapHash": number//2318572807,
  "AvatarVisionAfterTextMapHash": number//3710640289,
  "AvatarConstellationAfterTextMapHash": number//1057268155,
  "FetterId": number//122,
  "AvatarId": CharacterId//10000034,
  "OpenConds": any[]//[],
  "FinishConds": object[]
  // [
  //   {
  //     "CondType": "FETTER_COND_NOT_OPEN",
  //     "ParamList": []
  //   }
  // ]
}
const characterInfoSrc = require('../../GenshinData/ExcelBinOutput/FetterInfoExcelConfigData.json') as FetterInfoExcelConfigData[]

const characterInfo = Object.fromEntries(characterInfoSrc.map(data =>
  [data.AvatarId, data])) as Record<CharacterId, FetterInfoExcelConfigData>

export default characterInfo