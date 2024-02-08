import type { OptNode } from '../../../../Formula/optimization'
import type { ICharTC } from '../../../../Types/character'
import { optimizeTcUsingNodes } from './optimizeTc'

type WorkerData = {
  nodes: OptNode[]
  charTC: ICharTC
}

onmessage = async (e: MessageEvent<WorkerData>) => {
  const { nodes, charTC } = e.data
  optimizeTcUsingNodes(nodes, charTC, (r) => postMessage(r))
}
