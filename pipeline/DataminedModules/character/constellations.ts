type AvatarTalentExcelConfigData = {
  "TalentId": number//293,
  "NameTextMapHash": number//1369435161,
  "DescTextMapHash": number//2182377015,
  "Icon": string//"UI_Talent_U_Klee_01",
  "PrevTalent": number//292,
  "MainCostItemId": number//1129,
  "MainCostItemCount": number//1,
  "OpenConfig": string//"Klee_Constellation_3",
  "AddProps": any[]
  // [
  //     {},
  //     {}
  // ],
  "ParamList": number[]
  // [
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0
  // ]
}
const constellationsSrc = require('../../GenshinData/ExcelBinOutput/AvatarTalentExcelConfigData.json') as AvatarTalentExcelConfigData[]
const constellations = Object.fromEntries(constellationsSrc.map(data => [data.TalentId, data])) as { [id: number]: AvatarTalentExcelConfigData }

export default constellations