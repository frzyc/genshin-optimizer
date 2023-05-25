import { allArtifactSetKeys } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { getArtSheet } from '../Data/Artifacts'
import Artifact from '../Data/Artifacts/Artifact'
import KeyMap, { cacheValueString } from '../KeyMap'
import type { IArtifact, ISubstat, SubstatKey } from '../Types/artifact'
import { allSubstatKeys } from '../Types/artifact'
import { getRandomElementFromArray, getRandomIntInclusive } from './Util'

// do not randomize Prayers since they don't have all slots
const artSets = allArtifactSetKeys.filter((k) => !k.startsWith('Prayers'))
export function randomizeArtifact(base: Partial<IArtifact> = {}): IArtifact {
  const setKey = base.setKey ?? getRandomElementFromArray(artSets)
  const sheet = getArtSheet(setKey)
  const rarity = base.rarity ?? getRandomElementFromArray(sheet.rarity)
  const slot = base.slotKey ?? getRandomElementFromArray(sheet.slots)
  const mainStatKey =
    base.mainStatKey ?? getRandomElementFromArray(Artifact.slotMainStats(slot))
  const level = base.level ?? getRandomIntInclusive(0, rarity * 4)
  const substats: ISubstat[] = [0, 1, 2, 3].map(() => ({ key: '', value: 0 }))

  const { low, high } = Artifact.rollInfo(rarity)
  const totRolls = Math.floor(level / 4) + getRandomIntInclusive(low, high)
  const numOfInitialSubstats = Math.min(totRolls, 4)
  const numUpgradesOrUnlocks = totRolls - numOfInitialSubstats

  const RollStat = (substat: SubstatKey): number =>
    getRandomElementFromArray(Artifact.getSubstatRollData(substat, rarity))

  let remainingSubstats = allSubstatKeys.filter((key) => mainStatKey !== key)
  for (const substat of substats.slice(0, numOfInitialSubstats)) {
    substat.key = getRandomElementFromArray(remainingSubstats)
    substat.value = RollStat(substat.key)
    remainingSubstats = remainingSubstats.filter((key) => key !== substat.key)
  }
  for (let i = 0; i < numUpgradesOrUnlocks; i++) {
    const substat = getRandomElementFromArray(substats)
    substat.value += RollStat(substat.key as any)
  }
  for (const substat of substats)
    if (substat.key) {
      const value = cacheValueString(substat.value, KeyMap.unit(substat.key))
      substat.value = parseFloat(
        allStats.art.subRollCorrection[rarity]?.[substat.key]?.[value] ?? value
      )
    }

  return {
    setKey,
    rarity,
    slotKey: slot,
    mainStatKey,
    level,
    substats,
    location: base.location ?? '',
    lock: false,
  }
}
