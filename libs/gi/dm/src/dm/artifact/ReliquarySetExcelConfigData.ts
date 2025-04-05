import { artifactIdMap } from '../../mapping'
import { readExcelJSON } from '../../util'

type ReliquarySetExcelConfigData = {
  setId: number //15008,
  setIcon: string //"UI_RelicIcon_15008_4",
  setNeedNum: number[]
  // [
  //   2,
  //   4
  // ],
  equipAffixId: number //215008,
  containsList: number[]
  // [
  //   82340,
  //   82320,
  //   82350,
  //   82310,
  //   82330
  // ]
}
const reliquarySetExcelConfigDataSrc: ReliquarySetExcelConfigData[] =
  readExcelJSON('ExcelBinOutput/ReliquarySetExcelConfigData.json')

const reliquarySetExcelConfigData = Object.fromEntries(
  reliquarySetExcelConfigDataSrc
    .filter(({ setId }) => setId in artifactIdMap)
    .map((data) => [data.setId, data])
) as Record<number, ReliquarySetExcelConfigData>

export { reliquarySetExcelConfigData }
