export type ProudSkillExcelConfigData = {
  "proudSkillId": number//342101,
  "proudSkillGroupId": number//3421,
  "level": number//1,
  "proudSkillType": number//2,
  "nameTextMapHash": number//4119686205,
  "descTextMapHash": number//59436107,
  "unlockDescTextMapHash": number//4234322242,
  "icon": string//"UI_Talent_S_Noel_05",
  "costItems": object[]
  // [
  //   {},
  //   {},
  //   {},
  //   {}
  // ],
  "filterConds": string[]
  // [
  //   "TALENT_FILTER_NONE",
  //   "TALENT_FILTER_NONE"
  // ],
  "breakLevel": number//1,
  "paramDescList": number[]
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
  "lifeEffectParams": [
    "",
    "",
    "",
    "",
    ""
  ],
  "openConfig": "Noel_ProudSkill_21",
  "addProps": object[]
  // [
  //     {},
  //     {}
  // ],
  "paramList": number[]
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
  const { proudSkillGroupId, level } = data
  if (!skillGroups[proudSkillGroupId]) skillGroups[proudSkillGroupId] = []
  skillGroups[proudSkillGroupId][level - 1] = data
})
export default skillGroups
