import type { AscensionKey } from '@genshin-optimizer/gi/consts'

export const weaponAscensionMaxLevelLow = [20, 40, 50, 60, 70] as const
export const weaponMaxLevel = 90
export const weaponMaxLevelLow = 70
export const weaponAscensionMaxLevel = [
  ...weaponAscensionMaxLevelLow,
  80,
  90,
] as const
export const weaponAmbiguousLevel = (level: number) =>
  level !== weaponMaxLevel &&
  weaponAscensionMaxLevel.includes(
    level as (typeof weaponAscensionMaxLevel)[number]
  )
export const weaponAmbiguousLevelLow = (level: number) =>
  level !== weaponMaxLevelLow &&
  weaponAscensionMaxLevelLow.includes(
    level as (typeof weaponAscensionMaxLevelLow)[number]
  )
export const weaponMilestoneLevelsLow = [
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
export const weaponMilestoneLevels = [
  [90, 6],
  [80, 6],
  [80, 5],
  [70, 5],
  ...weaponMilestoneLevelsLow,
] as const

export const getWeaponLevelString = (
  level: number,
  ascension: AscensionKey
): string => `${level}/${weaponAscensionMaxLevel[ascension]}`

export function validateWeaponLevelAsc(
  level: number,
  ascension: AscensionKey
): { level: number; ascension: AscensionKey } {
  if (typeof level !== 'number' || level < 1 || level > weaponMaxLevel)
    level = 1
  if (typeof ascension !== 'number' || ascension < 0 || ascension > 6)
    ascension = 0

  if (
    level > weaponAscensionMaxLevel[ascension] ||
    level < (weaponAscensionMaxLevel[ascension - 1] ?? 0)
  )
    ascension = weaponAscensionMaxLevel.findIndex(
      (maxLvl) => level <= maxLvl
    ) as AscensionKey
  return { level, ascension }
}
