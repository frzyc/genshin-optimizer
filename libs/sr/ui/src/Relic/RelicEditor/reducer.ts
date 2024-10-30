import { validateRelic } from '@genshin-optimizer/sr/db'
import type { IRelic, ISubstat } from '@genshin-optimizer/sr/srod'

type ResetMessage = { type: 'reset' }
type SubstatMessage = { type: 'substat'; index: number; substat: ISubstat }
type OverwriteMessage = { type: 'overwrite'; relic: IRelic }
type UpdateMessage = { type: 'update'; relic: Partial<IRelic> }
type Message = ResetMessage | SubstatMessage | OverwriteMessage | UpdateMessage
export function relicReducer(
  state: IRelic | undefined,
  action: Message
): IRelic | undefined {
  const handle = () => {
    switch (action.type) {
      case 'reset':
        return undefined
      case 'substat': {
        const { index, substat } = action
        const newSubstats = [...state!.substats]
        const oldIndex = substat.key
          ? newSubstats.findIndex((current) => current.key === substat.key)
          : -1

        if (oldIndex === -1 || oldIndex === index) {
          newSubstats[index] = { ...substat }
        } else {
          // Already in used, swap the items instead
          const temp = newSubstats[index]
          newSubstats[index] = { ...newSubstats[oldIndex] }
          newSubstats[oldIndex] = { ...temp }
        }

        return { ...state!, substats: newSubstats }
      }
      case 'overwrite':
        return action.relic
      case 'update':
        return { ...state!, ...action.relic }
    }
  }
  const rel = handle()
  if (!rel) return rel
  // Disable substat sorting to avoid layout shift as substats are added.
  return validateRelic(rel, true, false)
}
