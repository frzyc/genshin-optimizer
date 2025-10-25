import type { AscensionKey } from '@genshin-optimizer/gi/consts'

export const charAscensionMaxLevelLow = [20, 40, 50, 60, 70] as const
export const charMaxLevel = 100
export const charMaxLevelLow = 70
export const charAscensionMaxLevel = [
  ...charAscensionMaxLevelLow,
  80,
  90,
] as const
export const charAmbiguousLevel = (level: number) =>
  level !== charMaxLevel &&
  charAscensionMaxLevel.includes(
    level as (typeof charAscensionMaxLevel)[number]
  )
export const charAmbiguousLevelLow = (level: number) =>
  level !== charMaxLevelLow &&
  charAscensionMaxLevelLow.includes(
    level as (typeof charAscensionMaxLevelLow)[number]
  )
export const charMilestoneLevelsLow = [
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
export const charMilestoneLevels = [
  [90, 6],
  [80, 6],
  [80, 5],
  [70, 5],
  ...charMilestoneLevelsLow,
] as const

export const getCharLevelString = (
  level: number,
  ascension: AscensionKey
): string => `${level}/${getCharMaxLevel(level, ascension)}`
export const getCharMaxLevel = (
  level: number,
  ascension: AscensionKey
): number => (level > 90 ? level : charAscensionMaxLevel[ascension])

export function validateCharLevelAsc(
  level: number,
  ascension: AscensionKey
): { level: number; ascension: AscensionKey } {
  if (typeof level !== 'number' || level < 1 || level > charMaxLevel) level = 1
  if (typeof ascension !== 'number' || ascension < 0 || ascension > 6)
    ascension = 0

  if (level > 90) {
    if (level > 97) level = 100
    else if (level > 92) level = 95
    else level = 90
    ascension = 6
  } else if (
    level > charAscensionMaxLevel[ascension] ||
    level < (charAscensionMaxLevel[ascension - 1] ?? 0)
  )
    ascension = charAscensionMaxLevel.findIndex(
      (maxLvl) => level <= maxLvl
    ) as AscensionKey
  return { level, ascension }
}
