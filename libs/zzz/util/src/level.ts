import type { MilestoneKey } from '@genshin-optimizer/zzz/consts'

export const milestoneMaxLevelLow = [10, 20, 30, 40, 50] as const
export const maxLevel = 60
export const maxLevelLow = 50
export const milestoneMaxLevel = [...milestoneMaxLevelLow, 60] as const
export const ambiguousLevel = (level: number) =>
  level !== maxLevel &&
  milestoneMaxLevel.includes(level as (typeof milestoneMaxLevel)[number])
export const ambiguousLevelLow = (level: number) =>
  level !== maxLevelLow &&
  milestoneMaxLevel.includes(level as (typeof milestoneMaxLevel)[number])
export const milestoneLevelsLow = [
  [50, 5],
  [50, 4],
  [40, 4],
  [40, 3],
  [30, 3],
  [30, 2],
  [20, 2],
  [20, 1],
  [10, 1],
  [10, 0],
  [1, 0],
] as const
export const milestoneLevels = [[60, 5], ...milestoneLevelsLow] as const

export const getLevelString = (
  level: number,
  promotion: MilestoneKey
): string => `${level}/${milestoneMaxLevel[promotion]}`

export function validateLevelMilestone(
  inputLevel: number,
  milestone: MilestoneKey
): { sanitizedLevel: number; milestone: MilestoneKey } {
  let sanitizedLevel = inputLevel
  if (
    typeof sanitizedLevel !== 'number' ||
    sanitizedLevel < 1 ||
    sanitizedLevel > 60
  )
    sanitizedLevel = 1
  if (typeof milestone !== 'number' || milestone < 0 || milestone > 6)
    milestone = 0

  if (
    sanitizedLevel > milestoneMaxLevel[milestone] ||
    sanitizedLevel < (milestoneMaxLevel[milestone - 1] ?? 0)
  )
    milestone = milestoneMaxLevel.findIndex(
      (maxLvl) => sanitizedLevel <= maxLvl
    ) as MilestoneKey
  return { sanitizedLevel, milestone }
}
