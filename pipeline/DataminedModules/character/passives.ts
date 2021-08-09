export type ProudSkillExcelConfigData = {
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

const skillGroups = {} as { [id: number]: ProudSkillExcelConfigData[] }

passivesSrc.forEach(data => {
  const { ProudSkillGroupId, Level } = data
  if (!skillGroups[ProudSkillGroupId]) skillGroups[ProudSkillGroupId] = []
  skillGroups[ProudSkillGroupId][Level - 1] = data
})
export default skillGroups