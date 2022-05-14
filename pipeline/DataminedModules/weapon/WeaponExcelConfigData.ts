import { DWeaponTypeKey } from "../.."
import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile } from "../../Util"

type WeaponExcelConfigData = {
  "weaponType": DWeaponTypeKey// "WEAPON_CLAYMORE",
  "rankLevel": 1 | 2 | 3 | 4 | 5 //4,
  "weaponBaseExp": number//50000,
  "skillAffix": number[]
  // [
  //   112407,
  //   0
  // ],
  "weaponProp": [
    {
      "propType": "FIGHT_PROP_BASE_ATTACK",
      "initValue": 42.4010009765625,
      "type": "GROW_CURVE_ATTACK_201"
    },
    {
      "propType": "FIGHT_PROP_DEFENSE_PERCENT",
      "initValue": 0.11259999871253967,
      "type": "GROW_CURVE_CRITICAL_201"
    }
  ],
  "awakenTexture": string//"ART/Equip/AvatarEquip/Equip_Claymore_Exotic/Equip_Claymore_Exotic_OverrideTexture/Equip_Claymore_Exotic_02_Tex_Diffuse",
  "awakenLightMapTexture": string//"ART/Equip/AvatarEquip/Equip_Claymore_Exotic/Equip_Claymore_Exotic_OverrideTexture/Equip_Claymore_Exotic_02_Tex_Lightmap",
  "awakenIcon": string//"UI_EquipIcon_Claymore_Exotic_Awaken",
  "weaponPromoteId": number//12407,
  "storyId": number//192407,
  "awakenCosts": number[]
  // [
  //   1000,
  //   2000,
  //   4000,
  //   8000
  // ],
  "gachaCardNameHashSuffix": number//3014887376,
  "gachaCardNameHashPre": number//216,
  "destroyReturnMaterial": number[]
  // [
  //   0
  // ],
  "destroyReturnMaterialCount": number[]
  // [
  //   0
  // ],
  "weight": number//2,
  "id": number//12407,
  "nameTextMapHash": number//680510411,
  "descTextMapHash": number//1683286045,
  "icon": "UI_EquipIcon_Claymore_Exotic",
  "itemType": "ITEM_WEAPON",
  "rank": 10,
  "gadgetId": 50012407
}
const weaponExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/WeaponExcelConfigData.json') as WeaponExcelConfigData[]
const weaponExcelConfigData = Object.fromEntries(weaponExcelConfigDataSrc.map(data =>
  [data.id, data]))

dumpFile(`${__dirname}/WeaponExcelConfigData_idmap_gen.json`,
  Object.fromEntries(weaponExcelConfigDataSrc.map(data => [data.id, nameToKey(TextMapEN[data.nameTextMapHash])])))

export default weaponExcelConfigData
