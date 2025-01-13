import type { IDisc, ISubstat } from '@genshin-optimizer/zzz/db'
import { validateDisc } from '@genshin-optimizer/zzz/db'

type ResetMessage = { type: 'reset' }
type SubstatMessage = { type: 'substat'; index: number; substat?: ISubstat }
type OverwriteMessage = { type: 'overwrite'; disc: IDisc }
type UpdateMessage = { type: 'update'; disc: Partial<IDisc> }
type Message = ResetMessage | SubstatMessage | OverwriteMessage | UpdateMessage
export function discReducer(
  state: IDisc | undefined,
  action: Message
): IDisc | undefined {
  const handle = () => {
    switch (action.type) {
      case 'reset':
        return undefined
      case 'substat': {
        const { index, substat } = action
        if (!substat)
          return {
            ...state!,
            substats: state!.substats.filter((_, i) => i !== index),
          }
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
        return action.disc
      case 'update':
        return { ...state!, ...action.disc }
    }
  }
  const rel = handle()
  if (!rel) return rel
  // Disable substat sorting to avoid layout shift as substats are added.
  return validateDisc(rel, true, false)
}
