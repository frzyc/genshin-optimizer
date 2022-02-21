import Artifact from "../Data/Artifacts/Artifact"
import { ArtifactSheet } from "../Data/Artifacts/ArtifactSheet"
import { allSubstats, IArtifact, ISubstat, SubstatKey } from "../Types/artifact"
import { allArtifactSets } from "../Types/consts"
import { getRandomElementFromArray, getRandomIntInclusive } from "./Util"
import artifactSubstatRollCorrection from '../Data/Artifacts/artifact_sub_rolls_correction_gen.json'
import KeyMap, { valueString } from "../KeyMap"

export async function randomizeArtifact(): Promise<IArtifact> {
  const setKey = getRandomElementFromArray(allArtifactSets)
  const sheet = await ArtifactSheet.get(setKey)!
  const rarity = getRandomElementFromArray(sheet.rarity)
  const slot = getRandomElementFromArray(sheet.slots)
  const mainStatKey = getRandomElementFromArray(Artifact.slotMainStats(slot))
  const level = getRandomIntInclusive(0, rarity * 4)
  const substats: ISubstat[] = [0, 1, 2, 3].map(i => ({ key: "", value: 0 }))

  const { low, high } = Artifact.rollInfo(rarity)
  const totRolls = Math.floor(level / 4) + getRandomIntInclusive(low, high)
  const numOfInitialSubstats = Math.min(totRolls, 4)
  const numUpgradesOrUnlocks = totRolls - numOfInitialSubstats

  const RollStat = (substat: SubstatKey): number =>
    getRandomElementFromArray(Artifact.getSubstatRollData(substat, rarity))

  let remainingSubstats = allSubstats.filter(key => mainStatKey !== key)
  for (const substat of substats.slice(0, numOfInitialSubstats)) {
    substat.key = getRandomElementFromArray(remainingSubstats)
    substat.value = RollStat(substat.key)
    remainingSubstats = remainingSubstats.filter(key => key !== substat.key)
  }
  for (let i = 0; i < numUpgradesOrUnlocks; i++) {
    let substat = getRandomElementFromArray(substats)
    substat.value += RollStat(substat.key as any)
  }
  for (const substat of substats)
    if (substat.key) {
      const value = valueString(substat.value, KeyMap.unit(substat.key))
      substat.value = parseFloat(artifactSubstatRollCorrection[rarity]?.[substat.key]?.[value] ?? value)
    }

  return {
    setKey, rarity, slotKey: slot, mainStatKey, level, substats, location: "", lock: false, exclude: false,
  }
}
