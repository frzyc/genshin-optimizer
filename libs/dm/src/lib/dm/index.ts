import artifactMainstatData from './artifact/artifactMainstat'
import artifactSubstatData from './artifact/artifactSubstat'
import {
  artifactSubstatRollCorrection,
  artifactSubstatRollData,
} from './artifact/artifactSubstatRolls'
import artifactPiecesData from './artifact/ReliquaryExcelConfigData'
import reliquarySetExcelConfigData from './artifact/ReliquarySetExcelConfigData'
import avatarCurveExcelConfigData from './character/AvatarCurveExcelConfigData'
import avatarExcelConfigData from './character/AvatarExcelConfigData'
import ascensionData from './character/AvatarPromoteExcelConfigData'
import type { AvatarSkillDepotExcelConfigData } from './character/AvatarSkillDepotExcelConfigData'
import avatarSkillDepotExcelConfigData from './character/AvatarSkillDepotExcelConfigData'
import avatarSkillExcelConfigData from './character/AvatarSkillExcelConfigData'
import avatarTalentExcelConfigData from './character/AvatarTalentExcelConfigData'
import fetterCharacterCardExcelConfigData from './character/FetterCharacterCardExcelConfigData'
import fetterInfoExcelConfigData from './character/FetterInfoExcelConfigData'
import type { ProudSkillExcelConfigData } from './character/ProudSkillExcelConfigData'
import proudSkillExcelConfigData from './character/ProudSkillExcelConfigData'
import rewardExcelConfigData from './character/RewardExcelConfigData'
import equipAffixExcelConfigData from './common/EquipAffixExcelConfigData'
import cookRecipeExcelConfigData from './food/CookRecipeExcelConfigData'
import materialExcelConfigData from './material/MaterialExcelConfigData'
import weaponCurveExcelConfigData from './weapon/WeaponCurveExcelConfigData'
import weaponExcelConfigData from './weapon/WeaponExcelConfigData'
import weaponPromoteExcelConfigData from './weapon/WeaponPromoteExcelConfigData'

// Artifact dm
export {
  artifactMainstatData,
  artifactSubstatData,
  artifactSubstatRollData,
  artifactSubstatRollCorrection,
  artifactPiecesData,
  reliquarySetExcelConfigData,
}
// Character dm
export type { AvatarSkillDepotExcelConfigData, ProudSkillExcelConfigData }
export {
  avatarCurveExcelConfigData,
  avatarExcelConfigData,
  ascensionData,
  fetterInfoExcelConfigData,
  avatarTalentExcelConfigData,
  fetterCharacterCardExcelConfigData,
  proudSkillExcelConfigData,
  rewardExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
}
// Weapon
export {
  weaponCurveExcelConfigData,
  weaponExcelConfigData,
  weaponPromoteExcelConfigData,
}
// Common
export { equipAffixExcelConfigData }
// Food
export { cookRecipeExcelConfigData }
// Material
export { materialExcelConfigData }
