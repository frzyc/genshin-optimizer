import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  MainStatKey,
  RarityKey,
  SubstatKey,
} from '@genshin-optimizer/consts'
import { allRarityKeys, allSubstatKeys } from '@genshin-optimizer/consts'
import { getRollsRemaining, getSubstatValue } from '@genshin-optimizer/gi-util'
import { objKeyMap } from '@genshin-optimizer/util'
import type { ICachedArtifact } from '../Types/artifact'
import type { RollColorKey } from '../Types/consts'

const maxStar: RarityKey = 5

const showPercentKeys = ['hp_', 'def_', 'atk_'] as const
export function artStatPercent(statkey: MainStatKey | SubstatKey) {
  return showPercentKeys.includes(statkey as (typeof showPercentKeys)[number])
    ? '%'
    : ''
}

export default class Artifact {
  //do not instantiate.
  constructor() {
    if (this instanceof Artifact)
      throw Error('A static class cannot be instantiated.')
  }

  static maxSubstatRollEfficiency = objKeyMap(
    allRarityKeys,
    (rarity) =>
      100 *
      Math.max(
        ...allSubstatKeys.map(
          (substat) =>
            getSubstatValue(substat, rarity) / getSubstatValue(substat, maxStar)
        )
      )
  )

  //ARTIFACT IN GENERAL
  static getArtifactEfficiency(
    artifact: ICachedArtifact,
    filter: Set<SubstatKey>
  ): { currentEfficiency: number; maxEfficiency: number } {
    const { substats, rarity, level } = artifact
    // Relative to max star, so comparison between different * makes sense.
    const currentEfficiency = substats
      .filter(({ key }) => key && filter.has(key))
      .reduce((sum, { efficiency }) => sum + (efficiency ?? 0), 0)

    const rollsRemaining = getRollsRemaining(level, rarity)
    const emptySlotCount = substats.filter((s) => !s.key).length
    const matchedSlotCount = substats.filter(
      (s) => s.key && filter.has(s.key)
    ).length
    const unusedFilterCount =
      filter.size -
      matchedSlotCount -
      (filter.has(artifact.mainStatKey as any) ? 1 : 0)
    let maxEfficiency
    if (emptySlotCount && unusedFilterCount)
      maxEfficiency =
        currentEfficiency +
        Artifact.maxSubstatRollEfficiency[rarity] * rollsRemaining
    // Rolls into good empty slot
    else if (matchedSlotCount)
      maxEfficiency =
        currentEfficiency +
        Artifact.maxSubstatRollEfficiency[rarity] *
          (rollsRemaining - emptySlotCount)
    // Rolls into existing matched slot
    else maxEfficiency = currentEfficiency // No possible roll

    return { currentEfficiency, maxEfficiency }
  }

  //start with {slotKey:art} end with {setKey:[slotKey]}
  static setToSlots = (
    artifacts: Dict<ArtifactSlotKey, ICachedArtifact>
  ): Dict<ArtifactSetKey, ArtifactSlotKey[]> => {
    const setToSlots: Dict<ArtifactSetKey, ArtifactSlotKey[]> = {}
    Object.entries(artifacts).forEach(([key, art]) => {
      if (!art) return
      if (setToSlots[art.setKey]) setToSlots[art.setKey]!.push(key)
      else setToSlots[art.setKey] = [key]
    })
    return setToSlots
  }
  static levelVariant = (level: number) =>
    ('roll' + (Math.floor(Math.max(level, 0) / 4) + 1)) as RollColorKey
}
