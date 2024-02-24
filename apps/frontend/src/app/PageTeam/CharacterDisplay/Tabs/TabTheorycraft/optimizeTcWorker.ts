import type { BuildTc } from '@genshin-optimizer/gi/db'
import type { OptNode } from '../../../../Formula/optimization'
import { optimizeTcUsingNodes } from './optimizeTc'

type WorkerData = {
  nodes: OptNode[]
  buildTc: BuildTc
}

onmessage = async (e: MessageEvent<WorkerData>) => {
  const { nodes, buildTc } = e.data
  optimizeTcUsingNodes(nodes, buildTc, (r) => postMessage(r))
}
