import artifactMainstatData from "./artifact/artifactMainstat"
import artifactSubstatData from "./artifact/artifactSubstat"
import { artifactSubstatRollData, artifactSubstatRollCorrection } from "./artifact/artifactSubstatRolls"
import artifactPiecesData from "./artifact/ReliquaryExcelConfigData"
import reliquarySetExcelConfigData from "./artifact/ReliquarySetExcelConfigData"
import characterExpCurve from "./character/AvatarCurveExcelConfigData"
import avatarExcelConfigData from "./character/AvatarExcelConfigData"
import ascensionData from "./character/AvatarPromoteExcelConfigData"
import characterInfo from "./character/characterInfo"
import constellations from "./character/constellations"
import fetterCharacterCardExcelConfigData from "./character/FetterCharacterCardExcelConfigData"
import skillGroups, { ProudSkillExcelConfigData } from "./character/passives"
import rewardExcelConfigData from "./character/RewardExcelConfigData"
import skillDepot, { AvatarSkillDepotExcelConfigData } from "./character/skillDepot"
import talentsData from "./character/talents"
import equipAffixExcelConfigData from "./common/EquipAffixExcelConfigData"
import cookRecipeExcelConfigData from "./food/CookRecipeExcelConfigData"
import materialExcelConfigData from "./material/MaterialExcelConfigData"
import weaponCurveExcelConfigData from "./weapon/WeaponCurveExcelConfigData"
import weaponExcelConfigData from "./weapon/WeaponExcelConfigData"
import weaponPromoteExcelConfigData from "./weapon/WeaponPromoteExcelConfigData"

// Artifact dm
export { artifactMainstatData, artifactSubstatData, artifactSubstatRollData, artifactSubstatRollCorrection, artifactPiecesData, reliquarySetExcelConfigData }

// Character dm
export { characterExpCurve, avatarExcelConfigData, ascensionData, characterInfo, constellations, fetterCharacterCardExcelConfigData, skillGroups, rewardExcelConfigData, skillDepot, talentsData, AvatarSkillDepotExcelConfigData, ProudSkillExcelConfigData }

// Weapon
export { weaponCurveExcelConfigData, weaponExcelConfigData, weaponPromoteExcelConfigData }


// Common
export { equipAffixExcelConfigData }

// Food
export { cookRecipeExcelConfigData }

// Material
export { materialExcelConfigData }
