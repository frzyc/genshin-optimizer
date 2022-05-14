import { DArtifactSlotKey } from "../.."
import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile } from "../../Util"

type ReliquaryExcelConfigData = {
  "equipType": DArtifactSlotKey//"EQUIP_BRACER",
  "showPic": string//"Eff_UI_RelicIcon_10003_4",
  "rankLevel": number//1,
  "mainPropDepotId": number//4000,
  "appendPropDepotId": number//101,
  "setId"?: number//10003,
  "addPropLevels": number[]
  // [
  //   5,
  //   9,
  //   13,
  //   17,
  //   21
  // ],
  "baseConvExp": number//420,
  "maxLevel": number//5,
  "storyId": number//180034,
  "destroyRule": "DESTROY_RETURN_MATERIAL",
  "destroyReturnMaterial": number[]
  // [
  //   202
  // ],
  "destroyReturnMaterialCount": number[]
  // [
  //   420
  // ],
  "id": number//53140,
  "nameTextMapHash": number//2752003612,
  "descTextMapHash": number//3184282712,
  "icon": string//"UI_RelicIcon_10003_4",
  "itemType": string//"ITEM_RELIQUARY",
  "weight": number//1,
  "rank": number//10,
  "gadgetId": number//70600041
}
const artifactPiecesDataSrc = require('../../GenshinData/ExcelBinOutput/ReliquaryExcelConfigData.json') as ReliquaryExcelConfigData[]

const artifactPiecesData = Object.fromEntries(artifactPiecesDataSrc.map(data => [data.id, data])) as Record<number, ReliquaryExcelConfigData>

dumpFile(`${__dirname}/ReliquaryExcelConfigData_idmap_gen.json`,
  Object.fromEntries(artifactPiecesDataSrc.map(data => [data.id, [data.setId, nameToKey(TextMapEN[data.nameTextMapHash])]])))

export default artifactPiecesData //
