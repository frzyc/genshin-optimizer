import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile } from "../../Util"

type MaterialExcelConfigData = { //ham
  "InteractionTitleTextMapHash": number//1636679151,
  "MaterialType": string//"MATERIAL_EXCHANGE",
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

export default materialExcelConfigData