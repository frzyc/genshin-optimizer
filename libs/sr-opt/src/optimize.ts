import { detach } from '@genshin-optimizer/pando'
import {
  allRelicSetKeys,
  type RelicSlotKey,
} from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import type { Calculator, Read, Tag } from '@genshin-optimizer/sr-formula'
import type { ParentCommand, ParentMessage } from './parentWorker'

export interface BuildResult {
  value: number
  ids: Record<RelicSlotKey, string>
}

export interface ProgressResult {
  numBuildsKept: number
  numBuildsComputed: number
  resultsSending?: boolean | undefined
}

export const MAX_BUILDS = 50_000

export async function optimize(
  calc: Calculator,
  optTarget: Read,
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>,
  numWorkers: number,
  setProgress: (progress: ProgressResult) => void
) {
  // Spawn a parent worker to compile nodes, split/filter relics and spawn child workers for calculating results
  const worker = new Worker(new URL('./parentWorker.ts', import.meta.url), {
    type: 'module',
  })

  // Wait for parent worker to report complete
  const buildResults = await new Promise<BuildResult[]>((res, rej) => {
    worker.onmessage = ({ data }: MessageEvent<ParentMessage>) => {
      switch (data.resultType) {
        case 'progress':
          setProgress({ ...data.progress })
          break
        case 'done':
          res([...data.buildResults])
          break
        case 'err':
          console.log(data)
          rej()
          break
      }
    }

    // Start worker
    const message: ParentCommand = {
      command: 'start',
      relicsBySlot: relicsBySlot,
      detachedNodes: detachNodes(optTarget, calc),
      numWorkers: numWorkers,
    }
    worker.postMessage(message)
  })

  worker.terminate()
  return buildResults
}

function detachNodes(optTarget: Read, calc: Calculator) {
  // Step 2: Detach nodes from Calculator
  const relicSetKeys = new Set(allRelicSetKeys)
  const detachedNodes = detach([optTarget], calc, (tag: Tag) => {
    if (tag['member'] !== 'member0') return undefined // Wrong member
    if (tag['et'] !== 'self') return undefined // Not applied (only) to self

    if (tag['src'] === 'dyn' && tag['qt'] === 'premod') return { q: tag['q']! } // Relic stat bonus
    if (tag['q'] === 'count' && relicSetKeys.has(tag['src'] as any))
      return { q: tag['src']! } // Relic set counter
    return undefined
  })
  return detachedNodes
}
