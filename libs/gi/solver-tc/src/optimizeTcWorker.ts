import type { BuildTc } from '@genshin-optimizer/gi/db'
import type { NumNode, OptNode } from '@genshin-optimizer/gi/wr'
import { optimizeTcUsingNodes } from './optimizeTc'

type WorkerData = {
  nodes: OptNode[]
  valueFilter: Array<{ value: NumNode; minimum: number }>
  buildTc: BuildTc
}

onmessage = async (e: MessageEvent<WorkerData>) => {
  const { nodes, valueFilter, buildTc } = e.data
  optimizeTcUsingNodes(nodes, valueFilter, buildTc, (r) => postMessage(r))
}

export default {}
