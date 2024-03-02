import type { AscensionKey } from '@genshin-optimizer/sr/consts'

export const ascensionMaxLevel = [20, 30, 40, 50, 60, 70, 80] as const
export const maxLevel = 80

export const ambiguousLevel = (level: number) =>
  level !== maxLevel &&
  ascensionMaxLevel.includes(level as (typeof ascensionMaxLevel)[number])

export const milestoneLevels = [
  [80, 6],
  [70, 6],
  [70, 5],
  [60, 5],
  [60, 4],
  [50, 4],
  [50, 3],
  [40, 3],
  [40, 2],
  [30, 2],
  [30, 1],
  [20, 1],
  [20, 0],
  [1, 0],
] as const

export const getLevelString = (
  level: number,
  ascension: AscensionKey
): string => `${level}/${ascensionMaxLevel[ascension]}`

export function validateLevelAsc(
  level: number,
  ascension: AscensionKey
): { level: number; ascension: AscensionKey } {
  if (typeof level !== 'number' || level < 1 || level > 80) level = 1
  if (typeof ascension !== 'number' || ascension < 0 || ascension > 6)
    ascension = 0

  if (
    level > ascensionMaxLevel[ascension] ||
    level < (ascensionMaxLevel[ascension - 1] ?? 0)
  )
    ascension = ascensionMaxLevel.findIndex(
      (maxLvl) => level <= maxLvl
    ) as AscensionKey
  return { level, ascension }
}
