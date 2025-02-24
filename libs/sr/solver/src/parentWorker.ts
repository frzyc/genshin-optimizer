import type { ParentCommand } from '@genshin-optimizer/game-opt/solver'
import { ParentWorker } from '@genshin-optimizer/game-opt/solver'

const parentWorker = new ParentWorker(
  () =>
    new Worker(new URL('./childWorker.ts', import.meta.url), { type: 'module' })
)

// Receiving a message from main thread to worker
onmessage = async (e: MessageEvent<ParentCommand>) => {
  try {
    await parentWorker.handleEvent(e)
  } catch (err) {
    console.error(err)
    postMessage({ resultType: 'err', message: JSON.stringify(err) })
  }
}
