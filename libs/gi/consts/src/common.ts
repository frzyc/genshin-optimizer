export const allRarityKeys = [5, 4, 3, 2, 1] as const
export type RarityKey = (typeof allRarityKeys)[number]
export const talentLimits = [1, 1, 2, 4, 6, 8, 10] as const

// Shared ascension keys (used by both characters and weapons)
export const allAscensionKeys = [0, 1, 2, 3, 4, 5, 6] as const
export type AscensionKey = (typeof allAscensionKeys)[number]

// Shared level constants (same for characters and weapons)
export const ascensionMaxLevelLow = [20, 40, 50, 60, 70] as const
export const maxLevelLow = 70
export const maxLevel = 90
export const ascensionMaxLevel = [...ascensionMaxLevelLow, 80, 90] as const
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
  [1, 0],
] as const
export const milestoneLevels = [
  [90, 6],
  [80, 6],
  [80, 5],
  [70, 5],
  ...milestoneLevelsLow,
] as const

export const ambiguousLevel = (level: number, maxLvl: number) =>
  level !== maxLvl &&
  ascensionMaxLevel.includes(level as (typeof ascensionMaxLevel)[number])
export const ambiguousLevelLow = (level: number) =>
  level !== maxLevelLow &&
  ascensionMaxLevelLow.includes(level as (typeof ascensionMaxLevelLow)[number])

export function validateLevelAsc(
  inputLevel: number,
  inputAscension: AscensionKey,
  maxLvl = 90
): { level: number; ascension: AscensionKey } {
  let level = inputLevel
  let ascension = inputAscension

  if (typeof level !== 'number' || level < 1 || level > maxLvl) level = 1
  if (typeof ascension !== 'number' || ascension < 0 || ascension > 6)
    ascension = 0

  if (
    level > ascensionMaxLevel[ascension] ||
    level < (ascensionMaxLevel[ascension - 1] ?? 0)
  )
    ascension = ascensionMaxLevel.findIndex(
      (maxL) => level <= maxL
    ) as AscensionKey
  return { level, ascension }
}

export const getLevelString = (
  level: number,
  ascension: AscensionKey
): string => `${level}/${ascensionMaxLevel[ascension]}`
