import type { Artifact } from '@genshin-optimizer/gi-frontend-gql'

// TODO: unit test
export function updateArtifactList(
  arts: Artifact[],
  newArt: Partial<Artifact>
) {
  const oldArt = arts.find((a) => a.id === newArt.id)
  if (!oldArt) return [...arts]
  if (oldArt.location !== newArt.location && newArt.location) {
    arts.forEach((a) => {
      if (a.slotKey !== newArt.slotKey) return
      // in corner case where both location and slot is updated in artifact, just set conflict to inventory
      a.location = newArt.slotKey === oldArt.slotKey ? oldArt.location : null
    })
  }
  return arts.map((a) => (a.id !== newArt.id ? a : { ...a, ...newArt }))
}
