import { readDMJSON } from '../../util'

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
const reliquaryCodexExcelConfigData = JSON.parse(
  readDMJSON('ExcelBinOutput/ReliquaryCodexExcelConfigData.json')
) as ReliquaryCodexExcelConfigData[]

export { reliquaryCodexExcelConfigData }
