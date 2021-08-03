type ReliquarySetExcelConfigData = {
  "SetId": number//15008,
  "SetIcon": string//"UI_RelicIcon_15008_4",
  "SetNeedNum": number[]
  // [
  //   2,
  //   4
  // ],
  "EquipAffixId": number//215008,
  "ContainsList": number[]
  // [
  //   82340,
  //   82320,
  //   82350,
  //   82310,
  //   82330
  // ]
}
const artifactSetDataSrc = require('../../GenshinData/ExcelBinOutput/ReliquarySetExcelConfigData.json') as ReliquarySetExcelConfigData[]

const artifactSetData = Object.fromEntries(artifactSetDataSrc.map(data => [data.SetId, data])) as Record<number, ReliquarySetExcelConfigData>

export default artifactSetData //