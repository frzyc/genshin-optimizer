import type { AscensionKey } from '@genshin-optimizer/zzz/consts'

export const ascensionMaxLevelLow = [10, 20, 30, 40, 50] as const
export const maxLevel = 60
export const maxLevelLow = 50
export const ascensionMaxLevel = [...ascensionMaxLevelLow, 60] as const
export const ambiguousLevel = (level: number) =>
  level !== maxLevel &&
  ascensionMaxLevel.includes(level as (typeof ascensionMaxLevel)[number])
export const ambiguousLevelLow = (level: number) =>
  level !== maxLevelLow &&
  ascensionMaxLevel.includes(level as (typeof ascensionMaxLevel)[number])
export const milestoneLevelsLow = [
  [50, 5],
  [40, 4],
  [30, 3],
  [20, 2],
  [10, 1],
  [1, 0],
] as const
export const milestoneLevels = [[60, 5], ...milestoneLevelsLow] as const

export const getLevelString = (
  level: number,
  ascension: AscensionKey
): string => `${level}/${ascensionMaxLevel[ascension]}`

export function validateLevelAsc(
  inputLevel: number,
  ascension: AscensionKey
): { sanitizedLevel: number; ascension: AscensionKey } {
  let sanitizedLevel = inputLevel
  if (
    typeof sanitizedLevel !== 'number' ||
    sanitizedLevel < 1 ||
    sanitizedLevel > 60
  )
    sanitizedLevel = 1
  if (typeof ascension !== 'number' || ascension < 0 || ascension > 6)
    ascension = 0

  if (
    sanitizedLevel > ascensionMaxLevel[ascension] ||
    sanitizedLevel < (ascensionMaxLevel[ascension - 1] ?? 0)
  )
    ascension = ascensionMaxLevel.findIndex(
      (maxLvl) => sanitizedLevel <= maxLvl
    ) as AscensionKey
  return { sanitizedLevel, ascension }
}
