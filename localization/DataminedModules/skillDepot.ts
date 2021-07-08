
type AvatarSkillDepotExcelConfigData = {
  "Id": number//3401,
  "EnergySkill": number//10343,
  "Skills": number[]// [10341, 10342, 0, 0],
  "SubSkills": number[]//[10344, 10101, 10102, 5034010],
  "ExtraAbilities": string[]//["", "", ""],
  "Talents": number[]//[341, 342, 343, 344, 345, 346],
  "TalentStarName": string//"Talent_Noel",
  "InherentProudSkillOpens": Array<{
    "ProudSkillGroupId"?: number//3421,
    "NeedAvatarPromoteLevel"?: number//1
  }>
  /*[
    {
      "ProudSkillGroupId": 3421,
      "NeedAvatarPromoteLevel": 1
    },
    {
      "ProudSkillGroupId": 3422,
      "NeedAvatarPromoteLevel": 4
    },
    {
      "ProudSkillGroupId": 3423
    },
    {},
    {}
  ],*/
  "SkillDepotAbilityGroup": string//""
}
const skillDepotSrc = require('../GenshinData/ExcelBinOutput/AvatarSkillDepotExcelConfigData.json') as AvatarSkillDepotExcelConfigData[]
//TODO: use this to extract talent strings for localization
const skillDepot = Object.fromEntries(skillDepotSrc.map(skill => {
  const { Id } = skill
  return [Id, skill]
}))

export default skillDepot