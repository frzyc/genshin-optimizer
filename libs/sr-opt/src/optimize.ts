import { detach } from '@genshin-optimizer/pando'
import {
  allRelicSetKeys,
  type RelicSlotKey,
} from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import type { Calculator, Read, Tag } from '@genshin-optimizer/sr-formula'
import type { OptimizeMessage } from './worker'
// TODO: maybe change this to sr-srod's IRelic, and return the relic objs, rather than IDs?
export async function OptimizeForNode(
  calc: Calculator,
  optTarget: Read,
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
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
  // Step 5: Calculate the value
  let best = -Infinity
  let bestIds = {} as Record<RelicSlotKey, string>
  // Calculate results on workers
  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  })
  await new Promise<void>((res, rej) => {
    worker.onmessage = ({ data }: MessageEvent<OptimizeMessage>) => {
      console.log(data)
      if (
        data.resultType === 'done' &&
        data.best !== undefined &&
        data.bestIds !== undefined
      ) {
        if (data.best > best) {
          best = data.best
          bestIds = data.bestIds
          res()
        }
      } else rej()
    }
    worker.postMessage({
      command: 'optimize',
      relicsBySlot,
      optTarget,
      detachedNodes,
    })
  })

  return { results: [best], resultsIds: [bestIds] }
}
