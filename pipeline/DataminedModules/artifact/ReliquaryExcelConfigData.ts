import { DArtifactSlotKey } from "../.."
import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile } from "../../Util"

type ReliquaryExcelConfigData = {
  "EquipType": DArtifactSlotKey//"EQUIP_BRACER",
  "ShowPic": string//"Eff_UI_RelicIcon_10003_4",
  "RankLevel": number//1,
  "MainPropDepotId": number//4000,
  "AppendPropDepotId": number//101,
  "SetId": number//10003,
  "AddPropLevels": number[]
  // [
  //   5,
  //   9,
  //   13,
  //   17,
  //   21
  // ],
  "BaseConvExp": number//420,
  "MaxLevel": number//5,
  "StoryId": number//180034,
  "DestroyRule": "DESTROY_RETURN_MATERIAL",
  "DestroyReturnMaterial": number[]
  // [
  //   202
  // ],
  "DestroyReturnMaterialCount": number[]
  // [
  //   420
  // ],
  "Id": number//53140,
  "NameTextMapHash": number//2752003612,
  "DescTextMapHash": number//3184282712,
  "Icon": string//"UI_RelicIcon_10003_4",
  "ItemType": string//"ITEM_RELIQUARY",
  "Weight": number//1,
  "Rank": number//10,
  "GadgetId": number//70600041
}
const artifactPiecesDataSrc = require('../../GenshinData/ExcelBinOutput/ReliquaryExcelConfigData.json') as ReliquaryExcelConfigData[]

const artifactPiecesData = Object.fromEntries(artifactPiecesDataSrc.map(data => [data.Id, data])) as Record<number, ReliquaryExcelConfigData>

dumpFile(`${__dirname}/ReliquaryExcelConfigData_idmap_gen.json`,
  Object.fromEntries(artifactPiecesDataSrc.map(data => [data.Id, [data.SetId, nameToKey(TextMapEN[data.NameTextMapHash])]])))

export default artifactPiecesData //