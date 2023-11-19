import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { artifactAsset } from '@genshin-optimizer/gi-assets'
import type { Artifact, Substat } from '@genshin-optimizer/gi-frontend-gql'
import type { IArtifact } from '@genshin-optimizer/gi-good'

export function artifactDefIcon(setKey: ArtifactSetKey) {
  return artifactAsset(setKey, 'flower') || artifactAsset(setKey, 'circlet')
}

/**
 * There are some type incompatibilities
 * @param art
 * @returns
 */
export function IArtifactToArtifact(
  art: IArtifact
): Omit<Artifact, 'genshinUserId' | 'id'> {
  const { location, substats, ...rest } = art

  return {
    ...rest,
    location: location ? location : null,
    substats: substats.filter((s) => s.key) as Substat[],
  }
}

export function findDupArtifact(art: Artifact, arts: Artifact[]) {
  const { setKey, rarity, level, slotKey, mainStatKey, substats } = art
  const candidates = arts.filter(
    (c) =>
      setKey === c.setKey &&
      rarity === c.rarity &&
      slotKey === c.slotKey &&
      mainStatKey === c.mainStatKey &&
      level >= c.level &&
      substats.every(
        (substat, i) =>
          !c.substats[i].key || // Candidate doesn't have anything on this slot
          (substat.key === c.substats[i].key && // Or editor simply has better substat
            substat.value >= c.substats[i].value)
      )
  )

  // Strictly upgraded artifact
  const upgraded = candidates
    .filter(
      (c) =>
        level > c.level &&
        (Math.floor(level / 4) === Math.floor(c.level / 4) // Check for extra rolls
          ? substats.every(
              (
                substat,
                i // Has no extra roll
              ) =>
                substat.key === c.substats[i].key &&
                substat.value === c.substats[i].value
            )
          : substats.some(
              (
                substat,
                i // Has extra rolls
              ) =>
                c.substats[i].key
                  ? substat.value > c.substats[i].value // Extra roll to existing substat
                  : substat.key // Extra roll to new substat
            ))
    )
    // prioritize same location
    .sort((candidates) => (candidates.location === art.location ? -1 : 1))

  // Strictly duplicated artifact
  const duplicated = candidates
    .filter(
      (candidate) =>
        level === candidate.level &&
        substats.every(
          (substat) =>
            !substat.key || // Empty slot
            candidate.substats.some(
              (candidateSubstat) =>
                substat.key === candidateSubstat.key && // Or same slot
                substat.value === candidateSubstat.value
            )
        )
    )
    .sort((candidates) => (candidates.location === art.location ? -1 : 1))
  return { duplicated, upgraded }
}
