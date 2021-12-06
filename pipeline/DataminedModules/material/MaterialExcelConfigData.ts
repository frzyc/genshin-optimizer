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
  "InteractionTitleTextMapHash": number//1636679151,
  "MaterialType": MaterialTypeKey//"MATERIAL_EXCHANGE",
  "StackLimit": number//2000,
  "UseParam": [],
  "EffectDescTextMapHash": number//1534927495,
  "SpecialDescTextMapHash": number//1854661785,
  "TypeDescTextMapHash": number//2901969398,
  "EffectIcon": string//"",
  "EffectName": string//"",
  "SatiationParams": [],
  "DestroyRule": string//"DESTROY_RETURN_MATERIAL",
  "DestroyReturnMaterial": [],
  "DestroyReturnMaterialCount": [],
  "Id": number//110005,
  "NameTextMapHash": number//111726292,
  "DescTextMapHash": number//149445085,
  "Icon": string//"UI_ItemIcon_110005",
  "ItemType": string//"ITEM_MATERIAL",
  "Rank": number//306
}

const materialExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/MaterialExcelConfigData.json') as MaterialExcelConfigData[]
//character data
const materialExcelConfigData = Object.fromEntries(materialExcelConfigDataSrc.map(data =>
  [data.Id, data])) as { [AvatarId: number]: MaterialExcelConfigData }

const materialType = new Set(materialExcelConfigDataSrc.map(data => data.MaterialType))
dumpFile(`${__dirname}/MaterialExcelConfigData_MaterialType_gen.json`, [...materialType])

dumpFile(`${__dirname}/MaterialExcelConfigData_idmap_gen.json`,
  Object.fromEntries(materialExcelConfigDataSrc.map(data => [data.Id, nameToKey(TextMapEN[data.NameTextMapHash])])))

// Debug file for seeing what items are in each Material type
// dumpFile(`${__dirname}/MaterialExcelConfigData_idmap_filtered_gen.json`,
//   Object.fromEntries(
//     materialExcelConfigDataSrc.filter(data => ["MATERIAL_FURNITURE_SUITE_FORMULA"].includes(data.MaterialType))
//       .map(data => [data.Id, nameToKey(TextMapEN[data.NameTextMapHash])])))

export default materialExcelConfigData