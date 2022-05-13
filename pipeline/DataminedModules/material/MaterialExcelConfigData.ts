import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile } from "../../Util"

export type MaterialTypeKey = null | "MATERIAL_FAKE_ABSORBATE" |
  "MATERIAL_ADSORBATE" | // Iron Coin only?
  "MATERIAL_CONSUME" | // Silgils, cooking recipes, consumable recipes
  "MATERIAL_TALENT" | // Talent mateirals
  "MATERIAL_AVATAR" | // Characters
  "MATERIAL_CHEST" | // Bundles, Cake for traveler,
  "MATERIAL_NOTICE_ADD_HP" | // consumables that add HP,
  "MATERIAL_EXCHANGE" | // general materials, billets
  "MATERIAL_WOOD" | // Woad!
  "MATERIAL_HOME_SEED" | // seeds
  "MATERIAL_QUEST" | // stuff from chests
  "MATERIAL_CRICKET" | // Crickets? wtf are these
  "MATERIAL_WIDGET" |
  "MATERIAL_FOOD" |
  "MATERIAL_EXP_FRUIT" |
  "MATERIAL_WEAPON_EXP_STONE" |
  "MATERIAL_AVATAR_MATERIAL" |
  "MATERIAL_RELIQUARY_MATERIAL" |
  "MATERIAL_ELEM_CRYSTAL" |
  "MATERIAL_CONSUME_BATCH_USE" |
  "MATERIAL_FISH_BAIT" |
  "MATERIAL_CHEST_BATCH_USE" | // more bundles?
  "MATERIAL_SELECTABLE_CHEST" |
  "MATERIAL_FLYCLOAK" |
  "MATERIAL_SEA_LAMP" |
  "MATERIAL_CHANNELLER_SLAB_BUFF" | // Some sort of buff thing? probably can skip?
  "MATERIAL_FISH_ROD" |
  "MATERIAL_NAMECARD" |
  "MATERIAL_COSTUME" |
  "MATERIAL_FURNITURE_SUITE_FORMULA" |
  "MATERIAL_FURNITURE_FORMULA" // Furniture set

type MaterialExcelConfigData = { //ham
  "interactionTitleTextMapHash": number//1636679151,
  "materialType": MaterialTypeKey//"MATERIAL_EXCHANGE",
  "stackLimit": number//2000,
  "useParam": [],
  "effectDescTextMapHash": number//1534927495,
  "specialDescTextMapHash": number//1854661785,
  "typeDescTextMapHash": number//2901969398,
  "effectIcon": string//"",
  "effectName": string//"",
  "satiationParams": [],
  "destroyRule": string//"DESTROY_RETURN_MATERIAL",
  "destroyReturnMaterial": [],
  "destroyReturnMaterialCount": [],
  "id": number//110005,
  "nameTextMapHash": number//111726292,
  "descTextMapHash": number//149445085,
  "icon": string//"UI_ItemIcon_110005",
  "itemType": string//"ITEM_MATERIAL",
  "rank": number//306
}

const materialExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/MaterialExcelConfigData.json') as MaterialExcelConfigData[]
//character data
const materialExcelConfigData = Object.fromEntries(materialExcelConfigDataSrc.map(data =>
  [data.id, data])) as { [AvatarId: number]: MaterialExcelConfigData }

const materialType = new Set(materialExcelConfigDataSrc.map(data => data.MaterialType))
dumpFile(`${__dirname}/MaterialExcelConfigData_MaterialType_gen.json`, [...materialType])

dumpFile(`${__dirname}/MaterialExcelConfigData_idmap_gen.json`,
  Object.fromEntries(materialExcelConfigDataSrc.map(data => [data.id, nameToKey(TextMapEN[data.nameTextMapHash])])))

// Debug file for seeing what items are in each Material type
// dumpFile(`${__dirname}/MaterialExcelConfigData_idmap_filtered_gen.json`,
//   Object.fromEntries(
//     materialExcelConfigDataSrc.filter(data => ["MATERIAL_FURNITURE_SUITE_FORMULA"].includes(data.MaterialType))
//       .map(data => [data.id, nameToKey(TextMapEN[data.nameTextMapHash])])))

export default materialExcelConfigData
