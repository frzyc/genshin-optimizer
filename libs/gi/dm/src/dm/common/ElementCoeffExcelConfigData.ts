import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { readDMJSON } from '../../util'

type ElementCoeffExcelConfigData = {
  crashCo: number // 1,
  elementLevelCo: number // 17.165606,
  level: number // 0,
  playerElementLevelCo: number // 17.165606,
  playerShieldLevelCo: number // 91.1791
}
const elementCoeffExcelConfigDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/ElementCoeffExcelConfigData.json')
) as ElementCoeffExcelConfigData[]

const elementCoeffExcelConfigData = {
  playerElementLevelCo: [] as number[],
  playerShieldLevelCo: [] as number[],
}
elementCoeffExcelConfigDataSrc.forEach((data) => {
  const { playerElementLevelCo, playerShieldLevelCo } = data
  elementCoeffExcelConfigData.playerElementLevelCo.push(playerElementLevelCo)
  elementCoeffExcelConfigData.playerShieldLevelCo.push(playerShieldLevelCo)
})

dumpFile(
  `${__dirname}/ElementCoeffExcelConfigData_gen.json`,
  elementCoeffExcelConfigData
)

export { elementCoeffExcelConfigData }
