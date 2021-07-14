type ProudSkillExcelConfigData = {
  "ProudSkillId": number//342101,
  "ProudSkillGroupId": number//3421,
  "Level": number//1,
  "ProudSkillType": number//2,
  "NameTextMapHash": number//4119686205,
  "DescTextMapHash": number//59436107,
  "UnlockDescTextMapHash": number//4234322242,
  "Icon": string//"UI_Talent_S_Noel_05",
  "CostItems": object[]
  // [
  //   {},
  //   {},
  //   {},
  //   {}
  // ],
  "FilterConds": string[]
  // [
  //   "TALENT_FILTER_NONE",
  //   "TALENT_FILTER_NONE"
  // ],
  "BreakLevel": number//1,
  "ParamDescList": number[]
  // [
  //   2427507414,
  //   666607366,
  //   3540150159,
  //   851185503,
  //   2672927838,
  //   3082332970,
  //   3533092951,
  //   146906413,
  //   3917368436,
  //   3971663087,
  //   2461662564,
  //   2867379219,
  //   3063793031,
  //   1869540363
  // ],
  "LifeEffectParams": [
    "",
    "",
    "",
    "",
    ""
  ],
  "OpenConfig": "Noel_ProudSkill_21",
  "AddProps": object[]
  // [
  //     {},
  //     {}
  // ],
  "ParamList": number[]
  // [
  //     0.30000001192092896,
  //     4.0,
  //     20.0,
  //     60.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0
  // ]
}
const passivesSrc = require('../../GenshinData/ExcelBinOutput/ProudSkillExcelConfigData.json') as ProudSkillExcelConfigData[]

// there will be dups, where one ProudSkillGroupId can have several entries. looks like none of them really matter for now...
// const depotIds = passivesSrc.map(data => data.ProudSkillGroupId).sort()
// for (let i = 1; i < depotIds.length; i++) 
//   if (depotIds[i]===depotIds[i-1]) console.warn(`ProudSkillGroupId ${depotIds[i]} has dups`);


const passives = Object.fromEntries(passivesSrc.map(data => [data.ProudSkillGroupId, data])) as { [id: number]: ProudSkillExcelConfigData }

export default passives