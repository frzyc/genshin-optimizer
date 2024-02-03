import type { AscensionKey } from '@genshin-optimizer/sr/consts'
export const ascensionMaxLevel = [20, 30, 40, 50, 60, 70, 80] as const

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
