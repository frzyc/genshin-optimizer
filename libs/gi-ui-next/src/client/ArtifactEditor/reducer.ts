import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  RarityKey,
} from '@genshin-optimizer/consts'
import { artMaxLevel, artSlotMainKeys } from '@genshin-optimizer/consts'
import type { Artifact, Substat } from '@genshin-optimizer/gi-frontend-gql'
import { allStats } from '@genshin-optimizer/gi-stats'
import { clamp } from '@genshin-optimizer/util'

type ResetMessage = { type: 'reset' }
type SubstatMessage = { type: 'substat'; index: number; substat?: Substat }
type OverwriteMessage = { type: 'overwrite'; artifact: Partial<Artifact> }
type UpdateMessage = { type: 'update'; artifact: Partial<Artifact> }
type Message = ResetMessage | SubstatMessage | OverwriteMessage | UpdateMessage
export function artifactReducer(
  state: Partial<Artifact>,
  action: Message
): Partial<Artifact> {
  switch (action.type) {
    case 'reset':
      return {}
    case 'substat': {
      const { index, substat } = action
      return updateSub(state, index, substat)
    }
    case 'overwrite':
      return update(state, action.artifact)
    case 'update':
      return update(state, action.artifact)
  }
}

function pick<T>(value: T | undefined, available: readonly T[], prefer?: T): T {
  if (prefer !== undefined && !available.includes(prefer)) prefer = undefined
  return value && available.includes(value) ? value : prefer ?? available[0]
}

// fields in an artifact is tightly coupled. This ensures that updates to one field is valid against other fields.
function update(oldArt: Partial<Artifact>, newArt: Partial<Artifact>) {
  if (newArt.setKey) {
    const data = allStats.art.data[newArt.setKey as ArtifactSetKey]
    const rarities = data.rarities.sort().reverse() // make highest rarity first in the array
    const slots = data.slots
    newArt.rarity = pick(newArt.rarity, rarities, oldArt?.rarity)
    newArt.slotKey = pick(newArt?.slotKey, slots, oldArt?.slotKey)
  }
  if (newArt.rarity) newArt.level = newArt.level ?? oldArt?.level ?? 0
  if (newArt.level !== undefined)
    newArt.level = clamp(
      newArt.level,
      0,
      artMaxLevel[(newArt.rarity ?? oldArt.rarity ?? 5) as RarityKey]
    )
  if (newArt.slotKey)
    newArt.mainStatKey = pick(
      newArt?.mainStatKey,
      artSlotMainKeys[newArt.slotKey as ArtifactSlotKey],
      oldArt?.mainStatKey
    )

  if (newArt.mainStatKey) {
    const substats = newArt.substats ?? oldArt.substats
    if (substats)
      newArt.substats = substats.filter(({ key }) => key !== newArt.mainStatKey)
  }
  const ret = { ...oldArt, ...newArt }
  if (!ret.substats) ret.substats = []
  if (!ret.lock) ret.lock = false
  return ret
}

function updateSub(
  artifact: Partial<Artifact>,
  index: number,
  substat?: Substat
) {
  const newState = structuredClone(artifact)
  if (!newState.substats) newState.substats = []
  if (!substat) newState.substats.filter((_, i) => i !== index)
  else {
    const oldIndex = newState.substats!.findIndex((s) => s.key === substat.key)

    if (oldIndex === -1 || oldIndex === index)
      newState.substats[index] = substat
    // Already in used, swap the items instead
    else if (newState.substats[index] && newState.substats[oldIndex])
      [newState.substats[index], newState.substats[oldIndex]] = [
        newState.substats[oldIndex],
        newState.substats[index],
      ]
  }

  return newState
}
