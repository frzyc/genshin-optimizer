import { CharacterId } from "../.."

export type AvatarSkillDepotExcelConfigData = {
  "id": number//3401,
  "energySkill": number//10343, //burst
  "skills": number[]// [10341, 10342, 0, 0], //[normal, skill]
  "subSkills": number[]//[10344, 10101, 10102, 5034010], //not used? seem to go nowhere
  "extraAbilities": string[]//["", "", ""],
  "talents": number[]//[341, 342, 343, 344, 345, 346],
  "talentStarName": string//"Talent_Noel",
  "inherentProudSkillOpens": {
    "proudSkillGroupId"?: number
    "needAvatarPromoteLevel"?: number
  }[]
  /*[
    {
      "proudSkillGroupId": 3421, //devotion passive1
      "needAvatarPromoteLevel": 1
    },
    {
      "proudSkillGroupId": 3422, //Nice and Clean passive2
      "needAvatarPromoteLevel": 4
    },
    {
      "proudSkillGroupId": 3423 //Maid's Knighthood passive3
    },
    {},
    {}
  ],*/
  "skillDepotAbilityGroup": string//""
}

/**
 * sources for different talents:
 * auto       AvatarSkillExcelConfigData
 * skill      AvatarSkillExcelConfigData
 * burst      AvatarSkillExcelConfigData
 * passive1   ProudSkillExcelConfigData
 * passive2   ProudSkillExcelConfigData
 * passive3   ProudSkillExcelConfigData
 * const#     AvatarSkillExcelConfigData
 */

const skillDepotSrc = require('../../GenshinData/ExcelBinOutput/AvatarSkillDepotExcelConfigData.json') as AvatarSkillDepotExcelConfigData[]

const skillDepot = Object.fromEntries(skillDepotSrc.map(skill => {
  //FIXME: custom processing because there are empty objects in here. for RaidenShogun only...
  if (skill.id === 5201) {
    const [k1, k2, k3, k4, k5] = skill.inherentProudSkillOpens
    skill.inherentProudSkillOpens = [k1, k2, k5, {}, {}]
  }
  return skill
}).map(skill => [skill.id, skill])) as { [id: number]: AvatarSkillDepotExcelConfigData }

export default skillDepot
