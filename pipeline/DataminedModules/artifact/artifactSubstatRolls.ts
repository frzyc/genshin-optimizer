import { extrapolateFloat } from "../../extrapolateFloat";
import artifactSubstatData from "./artifactSubstat";

const rollsForRarity = { 3: 2, 4: 4, 5: 6, }

/** accurate value = artifactSubstatRollCorrection[rarity][key][fastValue] */
export const artifactSubstatRollCorrection: Record<string, Record<string, Record<string, string>>> = {}

function getRolls(key: string, possibleRolls: number[], maxRolls: number, rarity: string): { [value: number]: number[][] } {
  const accurateStrings: Set<string> = new Set()
  const accuratePossibleRolls = possibleRolls.map(roll => key.endsWith("_") ? Math.fround(Math.fround(roll) * 100) : roll)
  const fastPossibleRolls = possibleRolls.map(roll => key.endsWith("_") ? roll * 100 : roll)

  const root: RollValue = { accurateValue: 0, accurateString: "", fastValue: 0, fastString: "", rolls: [], badChildCount: 0 }

  const allRolls = [root]
  for (let i = 0; i < allRolls.length; i++) {
    const current = allRolls[i], rolls = current.rolls
    if (rolls.length >= maxRolls) continue

    possibleRolls.forEach((_, i) => {
      // Generate both "accurateValue" that matches in-game calculation
      // and "fastValue" which is easier for on-site calculation.
      const accurateValue = Math.fround(current.accurateValue + accuratePossibleRolls[i])
      const fastValue = current.fastValue + fastPossibleRolls[i]

      const accurateString = key.endsWith("_")
        ? (Math.round(Math.fround(accurateValue * 10)) / 10).toFixed(1)
        : Math.round(accurateValue).toFixed(0)
      const fastString = key.endsWith("_")
        ? (Math.round(fastValue * 10) / 10).toFixed(1)
        : Math.round(fastValue).toFixed(0)

      const newEntry: RollValue = {
        accurateValue, accurateString, fastValue, fastString, rolls: [...rolls, i], badChildCount: 0
      }

      current[i] = newEntry
      allRolls.push(newEntry)
      accurateStrings.add(accurateString)
    })
  }

  // At this point, `allRolls` will have every node in the `root` tree
  // Furthermore, parents will preceed their children in the order that
  // they appear.

  for (const current of allRolls) {
    if (current.rolls.length >= maxRolls) continue
    possibleRolls.forEach((_, i) => {
      const child = current[i]

      if (!accurateStrings.has(child.fastString)) {
        // Keep track of where fast value does not equal to *any*
        // valid accurate value. In that case, we need to map them
        // to an accurate value, or simply don't use `current`.
        current.badChildCount += 1
      }
    })
  }

  const outputRolls: { [value: string]: RollValue[] } = {}
  for (const current of allRolls) {
    if (!current.rolls.length) continue

    const { accurateString } = current
    const array = outputRolls[accurateString] ?? []
    outputRolls[accurateString] = array

    // Pick rolls with the fewest "bad children", i.e., children where fast value
    // doesn't match any accurate value.
    const index = array.findIndex(other => other.rolls.length === current.rolls.length)
    if (index === -1)
      array.push(current) // Doesn't have roll of this length yet
    else if (array[index].badChildCount > current.badChildCount)
      array[index] = current // Roll with fewer bad children
    else if (array[index].badChildCount === current.badChildCount &&
      current.rolls.every((value, i, rolls) => !i || rolls[i - 1] >= value))
      array[index] = current // Prefer sorted rolls
  }

  for (const rolls of Object.values(outputRolls)) {
    for (const current of rolls) {
      possibleRolls.forEach((_, i) => {
        const child = current[i]
        if (!child) return

        // Check if we need to hard-code any fast value to accurate value
        if (!accurateStrings.has(child.fastString)) {
          if (!(rarity in artifactSubstatRollCorrection)) artifactSubstatRollCorrection[rarity] = {}
          if (!(key in artifactSubstatRollCorrection[rarity])) artifactSubstatRollCorrection[rarity][key] = {}
          artifactSubstatRollCorrection[rarity][key][child.fastString] = child.accurateString
        }
      })
    }
  }

  return Object.fromEntries(Object.entries(outputRolls).map(([key, value]) => [key, value.map(roll => roll.rolls)]))
}

export const artifactSubstatRollData = Object.fromEntries(Object.entries(rollsForRarity).map(([rarity, maxRolls]) =>
  [rarity, Object.fromEntries(Object.entries(artifactSubstatData[rarity]).map(([statKey, rolls]: [string, number[]]) =>
    [statKey, getRolls(statKey, rolls, maxRolls, rarity)]))]))

type RollValue = {
  [index: number]: RollValue
  accurateValue: number, accurateString: string
  fastValue: number, fastString: string

  rolls: number[]
  badChildCount: number
}
