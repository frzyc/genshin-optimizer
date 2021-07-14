import { CharacterId } from "../.."

type AvatarSkillDepotExcelConfigData = {
  "Id": number//3401,
  "EnergySkill": number//10343, //burst
  "Skills": number[]// [10341, 10342, 0, 0], //[normal, skill]
  "SubSkills": number[]//[10344, 10101, 10102, 5034010], //not used? seem to go nowhere
  "ExtraAbilities": string[]//["", "", ""],
  "Talents": number[]//[341, 342, 343, 344, 345, 346],
  "TalentStarName": string//"Talent_Noel",
  "InherentProudSkillOpens": Array<{
    "ProudSkillGroupId"?: number
    "NeedAvatarPromoteLevel"?: number
  }>
  /*[
    {
      "ProudSkillGroupId": 3421, //devotion passive1
      "NeedAvatarPromoteLevel": 1
    },
    {
      "ProudSkillGroupId": 3422, //Nice and Clean passive2
      "NeedAvatarPromoteLevel": 4
    },
    {
      "ProudSkillGroupId": 3423 //Maid's Knighthood passive3
    },
    {},
    {}
  ],*/
  "SkillDepotAbilityGroup": string//""
}
const skillDepotSrc = require('../../GenshinData/ExcelBinOutput/AvatarSkillDepotExcelConfigData.json') as AvatarSkillDepotExcelConfigData[]
const skillDepot = Object.fromEntries(skillDepotSrc.map(skill => [skill.Id, skill])) as { [id: number]: AvatarSkillDepotExcelConfigData }

export default skillDepot


/**
 * auto       AvatarSkillExcelConfigData
 * skill      AvatarSkillExcelConfigData
 * burst      AvatarSkillExcelConfigData
 * passive1   ProudSkillExcelConfigData
 * passive2   ProudSkillExcelConfigData
 * passive3   ProudSkillExcelConfigData
 * const#     AvatarSkillExcelConfigData
 */