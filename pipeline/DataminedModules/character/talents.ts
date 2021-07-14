type AvatarSkillExcelConfigData = {
  "Id": number// 10343,
  "NameTextMapHash": number// 1615963973,
  "AbilityName": "",
  "DescTextMapHash": number// 313107928,
  "SkillIcon": string// "Skill_E_Noel_01",
  "CdTime"?: number//15.0,
  "CostElemType": string//"Rock",
  "CostElemVal"?: number//60.0,
  "MaxChargeNum": number//1,
  "TriggerID": number//5,
  "LockShape": string//"CircleLockEnemyR8H6HC",
  "LockWeightParams": number[]
  // [
  //   1.0,
  //   1.0,
  //   0.30000001192092896,
  //   0.0
  // ],
  "IsAttackCameraLock": boolean//true,
  "BuffIcon": string//"",
  "ProudSkillGroupId": number//3439,
  "GlobalValueKey": string//""
}
const talentsSrc = require('../../GenshinData/ExcelBinOutput/AvatarSkillExcelConfigData.json') as AvatarSkillExcelConfigData[]
const talents = Object.fromEntries(talentsSrc.map(data => [data.Id, data])) as { [id: number]: AvatarSkillExcelConfigData }

export default talents