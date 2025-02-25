import type { ChildCommand } from '@genshin-optimizer/game-opt/solver'
import { ChildWorker } from '@genshin-optimizer/game-opt/solver'

const childWorker = new ChildWorker()

// Receiving a message from parent worker to child worker
onmessage = async (e: MessageEvent<ChildCommand>) => {
  try {
    await childWorker.handleEvent(e)
  } catch (err) {
    console.error(err)
    postMessage({ resultType: 'err', message: JSON.stringify(err) })
  }
}
