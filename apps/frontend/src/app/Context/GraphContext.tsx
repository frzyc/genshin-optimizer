import { createContext } from 'react'
import type { NumNode } from '../Formula/type'
import type { Build } from '../Solver/common'

export type ChartData = {
  valueNode: NumNode
  plotNode: NumNode
  data: Build[]
}
export type GraphContextObj = {
  chartData?: ChartData
  setChartData: (data: ChartData | undefined) => void
  graphBuilds: string[][] | undefined
  setGraphBuilds: (builds: string[][] | undefined) => void
}
export const GraphContext = createContext({} as GraphContextObj)
