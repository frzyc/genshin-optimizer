import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile } from "../../Util"
import { CharacterGrowCurveKey } from "./characterExpCurve"

type AvatarExcelConfigData = {
  "UseType": string//"AVATAR_FORMAL",
  "BodyType": string//"BODY_GIRL",
  "ScriptDataPathHashSuffix": number//236955362,
  "ScriptDataPathHashPre": number//37,
  "IconName": string//"UI_AvatarIcon_Noel",
  "SideIconName": string//"UI_AvatarIcon_Side_Noel",
  "QualityType": string//"QUALITY_PURPLE",
  "ChargeEfficiency": number//1.0,
  "CombatConfigHashSuffix": number//343596172,
  "CombatConfigHashPre": number//213,
  "InitialWeapon": number//12101,
  "WeaponType": string//"WEAPON_CLAYMORE",
  "ManekinPathHashSuffix": number//2351022431,
  "ManekinPathHashPre": number//246,
  "ImageName": string//"AvatarImage_Forward_Noel",
  "GachaCardNameHashSuffix": number//1952298245,
  "GachaCardNameHashPre": number//31,
  "GachaImageNameHashSuffix": number//1404854661,
  "GachaImageNameHashPre": number//53,
  "CoopPicNameHashSuffix": number//601338503,
  "CoopPicNameHashPre": 116,
  "CutsceneShow": string//"",
  "SkillDepotId": number//3401,
  "StaminaRecoverSpeed": number//25.0,
  "CandSkillDepotIds": any[]//[], used by Traveler?
  "ManekinJsonConfigHashSuffix": number//4186788044,
  "ManekinJsonConfigHashPre": number//152,
  "ManekinMotionConfig": number//103,
  "DescTextMapHash": number//1136975897,
  "AvatarIdentityType": string//"AVATAR_IDENTITY_NORMAL",
  "AvatarPromoteId": number//34,
  "AvatarPromoteRewardLevelList": number[]//[1, 3, 5],
  "AvatarPromoteRewardIdList": number[]//[900221, 900223, 900225],
  "FeatureTagGroupID": number//10000034,
  "InfoDescTextMapHash": number//1136975897,
  "HpBase": number//1012.0880126953125,
  "AttackBase": number//16.02720069885254,
  "DefenseBase": number//66.9532470703125,
  "Critical": number//0.05000000074505806,
  "CriticalHurt": number//0.5,
  "PropGrowCurves": [
    {
      "Type": "FIGHT_PROP_BASE_HP",
      "GrowCurve": CharacterGrowCurveKey//"GROW_CURVE_HP_S4"
    },
    {
      "Type": "FIGHT_PROP_BASE_ATTACK",
      "GrowCurve": CharacterGrowCurveKey//"GROW_CURVE_ATTACK_S4"
    },
    {
      "Type": "FIGHT_PROP_BASE_DEFENSE",
      "GrowCurve": CharacterGrowCurveKey//"GROW_CURVE_HP_S4"
    }
  ],
  "PrefabPathRagdollHashSuffix": number//3565889523,
  "PrefabPathRagdollHashPre": number//122,
  "Id": number//10000034,
  "NameTextMapHash": number//1921418842,
  "PrefabPathHashSuffix": number//874764124,
  "PrefabPathHashPre": number//5,
  "PrefabPathRemoteHashSuffix": number//1488236538,
  "PrefabPathRemoteHashPre": number//161,
  "ControllerPathHashSuffix": number//3475231846,
  "ControllerPathHashPre": number//220,
  "ControllerPathRemoteHashSuffix": number//549387400,
  "ControllerPathRemoteHashPre": number//101,
  "LODPatternName": string//""
}

const avatarExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/AvatarExcelConfigData.json') as AvatarExcelConfigData[]
//character data
const avatarExcelConfigData = Object.fromEntries(avatarExcelConfigDataSrc.map(data =>
  [data.Id, data])) as { [charId: number]: AvatarExcelConfigData }

dumpFile(`${__dirname}/AvatarExcelConfigData_idmap_gen.json`,
  Object.fromEntries(avatarExcelConfigDataSrc.map(data => [data.Id, nameToKey(TextMapEN[data.NameTextMapHash])])))

export default avatarExcelConfigData