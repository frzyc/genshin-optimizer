import type { InternalElement } from '../../mapping'
import { readDMJSON } from '../../util'

type AvatarSkillExcelConfigData = {
  id: number // 10343,
  nameTextMapHash: number // 1615963973,
  abilityName: ''
  descTextMapHash: number // 313107928,
  skillIcon: string // "Skill_E_Noel_01",
  CdTime?: number //15.0,
  costElemType: InternalElement //"Rock",
  CostElemVal?: number //60.0,
  maxChargeNum: number //1,
  triggerID: number //5,
  lockShape: string //"CircleLockEnemyR8H6HC",
  lockWeightParams: number[]
  // [
  //   1.0,
  //   1.0,
  //   0.30000001192092896,
  //   0.0
  // ],
  isAttackCameraLock: boolean //true,
  buffIcon: string //"",
  proudSkillGroupId: number //3439,
  globalValueKey: string //""
}
const avatarSkillExcelConfigDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/AvatarSkillExcelConfigData.json')
) as AvatarSkillExcelConfigData[]
const avatarSkillExcelConfigData = Object.fromEntries(
  avatarSkillExcelConfigDataSrc.map((data) => [data.id, data])
) as { [id: number]: AvatarSkillExcelConfigData }

export { avatarSkillExcelConfigData }
