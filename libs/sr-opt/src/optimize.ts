import { detach } from '@genshin-optimizer/pando'
import {
  allRelicSetKeys,
  type RelicSlotKey,
} from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import type { Calculator, Read, Tag } from '@genshin-optimizer/sr-formula'
import { range } from '@genshin-optimizer/util'
import type { OptimizeMessageDone } from './worker'
import { type OptimizeMessage } from './worker'
// TODO: maybe change this to sr-srod's IRelic, and return the relic objs, rather than IDs?
export async function OptimizeForNode(
  calc: Calculator,
  optTarget: Read,
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>,
  numWorkers: number
) {
  // Step 2: Detach nodes from Calculator
  const relicSetKeys = new Set(allRelicSetKeys)
  const detachedNodes = detach([optTarget], calc, (tag: Tag) => {
    if (tag['member'] !== 'member0') return undefined // Wrong member
    if (tag['et'] !== 'self') return undefined // Not applied (only) to self

    if (tag['src'] === 'dyn' && tag['qt'] === 'premod') return { q: tag['q']! } // Art stat bonus
    if (tag['q'] === 'count' && relicSetKeys.has(tag['src'] as any))
      return { q: tag['src']! } // Art set counter
    return undefined
  })

  const chunkSize = Math.ceil(relicsBySlot.head.length / numWorkers)
  // Calculate results on workers
  const workers = range(1, numWorkers).map(
    () =>
      new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
      })
  )
  // Wait for all workers to finish
  const results = await Promise.all(
    workers.map((worker, index) => {
      return new Promise<OptimizeMessageDone>((res, rej) => {
        // On worker completion, resolve promise
        worker.onmessage = ({ data }: MessageEvent<OptimizeMessage>) => {
          console.log(data)
          if (data.resultType === 'done') {
            res(data)
          } else rej()
        }
        // Chunk data
        const chunkedRelicsBySlot: Record<RelicSlotKey, ICachedRelic[]> = {
          head: relicsBySlot.head.slice(
            index * chunkSize,
            (index + 1) * chunkSize
          ),
          hand: relicsBySlot.hand,
          body: relicsBySlot.body,
          feet: relicsBySlot.feet,
          sphere: relicsBySlot.sphere,
          rope: relicsBySlot.rope,
        }
        // Start worker
        worker.postMessage({
          command: 'optimize',
          relicsBySlot: chunkedRelicsBySlot,
          optTarget,
          detachedNodes,
        })
      })
    })
  )

  return results.sort((a, b) => a.best - b.best)
}
