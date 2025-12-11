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
  FECDDOLDHBL: {
    proudSkillGroupId?: number
    LKJNHHPJKIA?: number // needAvatarPromoteLevel
  }[]
  // unlocked proudskills
  LLALJAIDKPI: [
    {
      AFMEMNMEABG: number[] // no clue [ 1000701 ],
      KLHCAFHKLNI: string // unlock condition "SPECIAL_PROUD_SKILL_OPEN_CONDITION_TYPE_QUEST_FINISH",
      proudSkillGroupId: number // 2251
    },
  ]
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
    proudSkillGroupId: number
    unlockCondition: string
    numberArray: number[]
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
      const { FECDDOLDHBL: _, ...obfSkillTrim } = obfSkill
      return {
        ...obfSkillTrim,
        inherentProudSkillOpens: obfSkill.FECDDOLDHBL.map((openObf) => {
          const { LKJNHHPJKIA: _, ...openObfTrim } = openObf
          return {
            ...openObfTrim,
            needAvatarPromoteLevel: openObf.LKJNHHPJKIA,
          }
        }),
        lockedProudSkillOpens: obfSkill.LLALJAIDKPI.map((openObf) => ({
          ...openObf,
          numberArray: openObf.AFMEMNMEABG,
          unlockCondition: openObf.KLHCAFHKLNI,
        })),
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
