import { DWeaponTypeKey } from "../.."

type WeaponExcelConfigData = {
  "WeaponType": DWeaponTypeKey// "WEAPON_CLAYMORE",
  "RankLevel": number//4,
  "WeaponBaseExp": number//50000,
  "SkillAffix": number[]
  // [
  //   112407,
  //   0
  // ],
  "WeaponProp": [
    {
      "PropType": "FIGHT_PROP_BASE_ATTACK",
      "InitValue": 42.4010009765625,
      "Type": "GROW_CURVE_ATTACK_201"
    },
    {
      "PropType": "FIGHT_PROP_DEFENSE_PERCENT",
      "InitValue": 0.11259999871253967,
      "Type": "GROW_CURVE_CRITICAL_201"
    }
  ],
  "AwakenTexture": string//"ART/Equip/AvatarEquip/Equip_Claymore_Exotic/Equip_Claymore_Exotic_OverrideTexture/Equip_Claymore_Exotic_02_Tex_Diffuse",
  "AwakenLightMapTexture": string//"ART/Equip/AvatarEquip/Equip_Claymore_Exotic/Equip_Claymore_Exotic_OverrideTexture/Equip_Claymore_Exotic_02_Tex_Lightmap",
  "AwakenIcon": string//"UI_EquipIcon_Claymore_Exotic_Awaken",
  "WeaponPromoteId": number//12407,
  "StoryId": number//192407,
  "AwakenCosts": number[]
  // [
  //   1000,
  //   2000,
  //   4000,
  //   8000
  // ],
  "GachaCardNameHashSuffix": number//3014887376,
  "GachaCardNameHashPre": number//216,
  "DestroyReturnMaterial": number[]
  // [
  //   0
  // ],
  "DestroyReturnMaterialCount": number[]
  // [
  //   0
  // ],
  "Weight": number//2,
  "Id": number//12407,
  "NameTextMapHash": number//680510411,
  "DescTextMapHash": number//1683286045,
  "Icon": "UI_EquipIcon_Claymore_Exotic",
  "ItemType": "ITEM_WEAPON",
  "Rank": 10,
  "GadgetId": 50012407
}
const weaponDataSrc = require('../../GenshinData/ExcelBinOutput/WeaponExcelConfigData.json') as WeaponExcelConfigData[]
const weaponData = Object.fromEntries(weaponDataSrc.map(data =>
  [data.Id, data]))

export default weaponData