import { Ascension } from "../Types/consts"

export const ascensionMaxLevelLow = [20, 40, 50, 60, 70] as const
export const maxLevel = 90
export const maxLevelLow = 70
export const ascensionMaxLevel = [...ascensionMaxLevelLow, 80, 90] as const
export const ambiguousLevel = (level) => level !== maxLevel && ascensionMaxLevel.includes(level)
export const ambiguousLevelLow = (level) => level !== maxLevelLow && ascensionMaxLevelLow.includes(level)
export const milestoneLevelsLow = [
  [70, 4],
  [60, 4],
  [60, 3],
  [50, 3],
  [50, 2],
  [40, 2],
  [40, 1],
  [20, 1],
  [20, 0],
  [1, 0]
] as const
export const milestoneLevels = [
  [90, 6],
  [80, 6],
  [80, 5],
  [70, 5],
  ...milestoneLevelsLow
] as const

export const getLevelString = (level: number, ascension: Ascension): string =>
  `${level}/${ascensionMaxLevel[ascension]}`

export function validateLevelAsc(level: number, ascension: Ascension): { level: number, ascension: Ascension } {
  if (typeof level !== "number" || level < 1 || level > 90) level = 1
  if (typeof ascension !== "number" || ascension < 0 || ascension > 6) ascension = 0

  if (level > ascensionMaxLevel[ascension] || level < (ascensionMaxLevel[ascension - 1] ?? 0))
    ascension = ascensionMaxLevel.findIndex(maxLvl => level <= maxLvl) as Ascension
  return { level, ascension }
}
