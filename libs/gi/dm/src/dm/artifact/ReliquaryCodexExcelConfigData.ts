import { readExcelJSON } from '../../util'

type ReliquaryCodexExcelConfigData = {
  Id: number
  suitId: number
  level: number
  cupId?: number
  leatherId?: number
  capId: number
  flowerId?: number
  sandId?: number
  SortOrder: number
}
const reliquaryCodexExcelConfigData: ReliquaryCodexExcelConfigData[] =
  readExcelJSON('ExcelBinOutput/ReliquaryCodexExcelConfigData.json')

export { reliquaryCodexExcelConfigData }
