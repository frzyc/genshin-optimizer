import type { GeneratedBuild } from '@genshin-optimizer/gi/db'
import { createContext } from 'react'
import type { NumNode } from '../Formula/type'

type Data = GeneratedBuild & {
  value: number
  plot?: number
}

export type ChartData = {
  valueNode: NumNode
  plotNode: NumNode
  data: Data[]
}
export type GraphContextObj = {
  chartData?: ChartData
  setChartData: (data: ChartData | undefined) => void
  graphBuilds: GeneratedBuild[] | undefined
  setGraphBuilds: (builds: GeneratedBuild[] | undefined) => void
}
export const GraphContext = createContext({} as GraphContextObj)
