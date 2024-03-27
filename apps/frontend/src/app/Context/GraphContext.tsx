import type { GeneratedBuild } from '@genshin-optimizer/gi/db'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { createContext } from 'react'

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
