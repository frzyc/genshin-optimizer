import type { NumTagFree } from '@genshin-optimizer/pando'
import { combineConst, compile, flatten } from '@genshin-optimizer/pando'
import { type RelicSlotKey } from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import { getRelicMainStatVal } from '@genshin-optimizer/sr-util'

export type WorkerCommand = Optimize

export interface Optimize {
  command: 'optimize'
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
  detachedNodes: NumTagFree[]
}

export interface OptimizeMessage {
  resultType: 'err' | 'done'
  message?: string
  best?: number
  bestIds?: Record<RelicSlotKey, string>
}

// Get proper typings for posting a message back to main thread
declare function postMessage(message: OptimizeMessage): void

// Receiving a message from main thread to worker
onmessage = async (e: MessageEvent<WorkerCommand>) => {
  try {
    await handleEvent(e)
  } catch (err) {
    console.log(err)
    postMessage({ resultType: 'err', message: JSON.stringify(err) })
  }
}

async function handleEvent(e: MessageEvent<WorkerCommand>): Promise<void> {
  const { data } = e,
    { command } = data
  switch (command) {
    case 'optimize':
      postMessage({ resultType: 'done', ...optimize(data) })
  }
}

// Exhaustive search for best result
function optimize({ relicsBySlot, detachedNodes }: Optimize) {
  // Step 3: Optimize nodes, as needed
  detachedNodes = flatten(detachedNodes)
  detachedNodes = combineConst(detachedNodes)

  // Step 4: Compile for quick iteration
  const compiledCalcFunction = compile(
    detachedNodes,
    'q', // Tag category for object key
    6, // Number of slots
    {} // Initial values
    // Header; includes custom formulas, such as `res`
  )

  let best = -Infinity
  let bestIds = {} as Record<RelicSlotKey, string>
  relicsBySlot.head.forEach((headRelic) => {
    const headStats = convertRelicToStats(headRelic)
    relicsBySlot.hand.forEach((handRelic) => {
      const handStats = convertRelicToStats(handRelic)
      relicsBySlot.feet.forEach((feetRelic) => {
        const feetStats = convertRelicToStats(feetRelic)
        relicsBySlot.body.forEach((bodyRelic) => {
          const bodyStats = convertRelicToStats(bodyRelic)
          relicsBySlot.sphere.forEach((sphereRelic) => {
            const sphereStats = convertRelicToStats(sphereRelic)
            relicsBySlot.rope.forEach((ropeRelic) => {
              const ropeStats = convertRelicToStats(ropeRelic)
              const val = compiledCalcFunction([
                headStats,
                handStats,
                feetStats,
                bodyStats,
                sphereStats,
                ropeStats,
              ])
              if (val[0] > best) {
                best = val[0]
                bestIds = {
                  head: headRelic.id,
                  hand: handRelic.id,
                  feet: feetRelic.id,
                  body: bodyRelic.id,
                  sphere: sphereRelic.id,
                  rope: ropeRelic.id,
                }
              }
            })
          })
        })
      })
    })
  })
  return { best, bestIds }
}

function convertRelicToStats(relic: ICachedRelic) {
  const a = {
    [relic.mainStatKey]: getRelicMainStatVal(
      relic.rarity,
      relic.mainStatKey,
      relic.level
    ),
    ...Object.fromEntries(
      relic.substats.map((substat) => [substat.key, substat.value])
    ),
  }
  return a
}
