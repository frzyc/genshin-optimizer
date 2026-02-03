import { deobfPropMappings } from '../../mapping'
import { readDMJSON } from '../../util'

type AvatarSkillDepotExcelConfigDataObf = {
  id: number //3401,
  energySkill: number //10343, //burst
  skills: number[] // [10341, 10342, 0, 0], //[normal, skill]
  subSkills: number[] //[10344, 10101, 10102, 5034010], //not used? seem to go nowhere
  extraAbilities: string[] //["", "", ""],
  talents: number[] //[341, 342, 343, 344, 345, 346],
  talentStarName: string //"Talent_Noel",
  // inherentProudSkillOpens
  [deobfPropMappings.inherentProudSkillOpens]: {
    proudSkillGroupId?: number
    [deobfPropMappings.needAvatarPromoteLevel]?: number // needAvatarPromoteLevel
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
  // unlocked proudskills
  [deobfPropMappings.lockedProudSkillOpens]: {
    [deobfPropMappings.numberArray]: number[] // no clue, prob related to proudSkillId [ 1000701 ],
    [deobfPropMappings.unlockCondition]: string // unlock condition "SPECIAL_PROUD_SKILL_OPEN_CONDITION_TYPE_QUEST_FINISH",
    proudSkillGroupId: number // 2251
  }[]
  skillDepotAbilityGroup: string //""
}
export type AvatarSkillDepotExcelConfigData = {
  id: number //3401,
  energySkill: number //10343, //burst
  skills: number[] // [10341, 10342, 0, 0], //[normal, skill]
  subSkills: number[] //[10344, 10101, 10102, 5034010], //not used? seem to go nowhere
  extraAbilities: string[] //["", "", ""],
  talents: number[] //[341, 342, 343, 344, 345, 346],
  talentStarName: string //"Talent_Noel",
  inherentProudSkillOpens: {
    proudSkillGroupId?: number
    needAvatarPromoteLevel?: number
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
  lockedProudSkillOpens: {
    numberArray: number[]
    unlockCondition: string
    proudSkillGroupId: number
  }[]
  skillDepotAbilityGroup: string //""
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

const avatarSkillDepotExcelConfigDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/AvatarSkillDepotExcelConfigData.json')
) as AvatarSkillDepotExcelConfigDataObf[]

const avatarSkillDepotExcelConfigData = Object.fromEntries(
  avatarSkillDepotExcelConfigDataSrc
    // Convert obfuscated properties to unobf names
    .map((obfSkill) => {
      const {
        [deobfPropMappings.inherentProudSkillOpens]: inherentProudSkillOpens,
        [deobfPropMappings.lockedProudSkillOpens]: lockedProudSkillOpens,
        ...obfSkillTrim
      } = obfSkill
      return {
        ...obfSkillTrim,
        inherentProudSkillOpens: inherentProudSkillOpens.map((openObf) => {
          const {
            [deobfPropMappings.needAvatarPromoteLevel]: needAvatarPromoteLevel,
            ...openObfTrim
          } = openObf
          return {
            ...openObfTrim,
            needAvatarPromoteLevel,
          }
        }),
        lockedProudSkillOpens: lockedProudSkillOpens.map((openObf) => {
          const {
            [deobfPropMappings.numberArray]: numberArray,
            [deobfPropMappings.unlockCondition]: unlockCondition,
            ...openObfTrim
          } = openObf
          return {
            ...openObfTrim,
            numberArray,
            unlockCondition,
          }
        }),
      } as AvatarSkillDepotExcelConfigData
    })
    .map((skill) => {
      //FIXME: custom processing because there are empty objects in here. for RaidenShogun only...
      if (skill.id === 5201) {
        const [k1, k2, , , k5] = skill.inherentProudSkillOpens
        skill.inherentProudSkillOpens = [k1, k2, k5, {}, {}]
      }
      return skill
    })
    .map((skill) => [skill.id, skill])
) as { [id: number]: AvatarSkillDepotExcelConfigData }

export { avatarSkillDepotExcelConfigData }
