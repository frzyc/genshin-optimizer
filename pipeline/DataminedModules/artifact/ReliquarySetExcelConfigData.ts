type ReliquarySetExcelConfigData = {
  "setId": number//15008,
  "setIcon": string//"UI_RelicIcon_15008_4",
  "setNeedNum": number[]
  // [
  //   2,
  //   4
  // ],
  "EquipAffixId": number//215008,
  "containsList": number[]
  // [
  //   82340,
  //   82320,
  //   82350,
  //   82310,
  //   82330
  // ]
}
const reliquarySetExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/ReliquarySetExcelConfigData.json') as ReliquarySetExcelConfigData[]

const reliquarySetExcelConfigData = Object.fromEntries(reliquarySetExcelConfigDataSrc.map(data => [data.setId, data])) as Record<number, ReliquarySetExcelConfigData>

export default reliquarySetExcelConfigData //
