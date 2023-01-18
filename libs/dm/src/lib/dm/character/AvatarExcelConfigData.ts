import { CharacterGrowCurveKey, CharacterId, characterIdMap, DQualityKey, dumpFile, DWeaponTypeKey } from "@genshin-optimizer/pipeline"
import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { readDMJSON } from "../../util"

type AvatarExcelConfigData = {
  "useType"?: string//"AVATAR_FORMAL",
  "bodyType": string//"BODY_GIRL",
  "scriptDataPathHashSuffix": number//236955362,
  "scriptDataPathHashPre": number//37,
  "iconName": string//"UI_AvatarIcon_Noel",
  "sideIconName": string//"UI_AvatarIcon_Side_Noel",
  "qualityType": DQualityKey//"QUALITY_PURPLE",
  "chargeEfficiency": number//1.0,
  "combatConfigHashSuffix": number//343596172,
  "combatConfigHashPre": number//213,
  "initialWeapon": number//12101,
  "weaponType": DWeaponTypeKey//"WEAPON_CLAYMORE",
  "manekinPathHashSuffix": number//2351022431,
  "manekinPathHashPre": number//246,
  "imageName": string//"AvatarImage_Forward_Noel",
  "gachaCardNameHashSuffix": number//1952298245,
  "gachaCardNameHashPre": number//31,

  // old keys
  // "GachaImageNameHashSuffix": number//1404854661,
  // "GachaImageNameHashPre": number//53,
  // "CoopPicNameHashSuffix": number//601338503,
  // "CoopPicNameHashPre": 116,

  // wtf are these
  // "FBOKCBDCILD": 3845926595,
  // "EAOMKNHGEOE": 22,
  "cutsceneShow": string//"",
  "skillDepotId": number//3401,
  "staminaRecoverSpeed": number//25.0,
  "candSkillDepotIds": number[]//[], used by Traveler?
  "manekinJsonConfigHashSuffix": number//4186788044,
  "manekinJsonConfigHashPre": number//152,
  "manekinMotionConfig": number//103,
  "descTextMapHash": number//1136975897,
  "avatarIdentityType": string//"AVATAR_IDENTITY_NORMAL",
  "avatarPromoteId": number//34,
  "avatarPromoteRewardLevelList": number[]//[1, 3, 5],
  "avatarPromoteRewardIdList": number[]//[900221, 900223, 900225],
  "featureTagGroupID": number//10000034,
  "infoDescTextMapHash": number//1136975897,
  "hpBase": number//1012.0880126953125,
  "attackBase": number//16.02720069885254,
  "defenseBase": number//66.9532470703125,
  "critical": number//0.05000000074505806,
  "criticalHurt": number//0.5,
  "propGrowCurves": [
    {
      "type": "FIGHT_PROP_BASE_HP",
      "growCurve": CharacterGrowCurveKey//"GROW_CURVE_HP_S4"
    },
    {
      "type": "FIGHT_PROP_BASE_ATTACK",
      "growCurve": CharacterGrowCurveKey//"GROW_CURVE_ATTACK_S4"
    },
    {
      "type": "FIGHT_PROP_BASE_DEFENSE",
      "growCurve": CharacterGrowCurveKey//"GROW_CURVE_HP_S4"
    }
  ],
  "prefabPathRagdollHashSuffix": number//3565889523,
  "prefabPathRagdollHashPre": number//122,
  "id": CharacterId//10000034,
  "nameTextMapHash": number//1921418842,
  "prefabPathHashSuffix": number//874764124,
  "prefabPathHashPre": number//5,
  "prefabPathRemoteHashSuffix": number//1488236538,
  "prefabPathRemoteHashPre": number//161,
  "controllerPathHashSuffix": number//3475231846,
  "controllerPathHashPre": number//220,
  "controllerPathRemoteHashSuffix": number//549387400,
  "controllerPathRemoteHashPre": number//101,
  "LODPatternName": string//""
}

const avatarExcelConfigDataSrc = JSON.parse(readDMJSON("ExcelBinOutput/AvatarExcelConfigData.json")) as AvatarExcelConfigData[]
//character data
const avatarExcelConfigData = Object.fromEntries(avatarExcelConfigDataSrc.filter(({ id }) => id in characterIdMap).map(data =>
  [data.id, data])) as Record<CharacterId, AvatarExcelConfigData>

dumpFile(`${__dirname}/AvatarExcelConfigData_idmap_gen.json`,
  Object.fromEntries(avatarExcelConfigDataSrc.map(data => [data.id, nameToKey(TextMapEN[data.nameTextMapHash])])))

export default avatarExcelConfigData
