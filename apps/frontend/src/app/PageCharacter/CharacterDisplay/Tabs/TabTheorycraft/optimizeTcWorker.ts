import type { OptNode } from '../../../../Formula/optimization'
import type { ICharTC } from '../../../../Types/character'
import { countPerms, optimizeTcUsingNodes } from './optimizeTc'

type WorkerData = {
  nodes: OptNode[]
  charTC: ICharTC
}
export {}
onmessage = async (e: MessageEvent<WorkerData>) => {
  const { nodes, charTC } = e.data
  console.log({ nodes, charTC })
  const perms = countPerms(charTC)
  console.log({ perms })
  const data = optimizeTcUsingNodes(nodes, charTC)
  console.log({ data })
  postMessage(data)
}
