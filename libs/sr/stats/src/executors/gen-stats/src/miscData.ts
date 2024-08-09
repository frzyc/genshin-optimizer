import { avatarBreakDamage } from '@genshin-optimizer/sr/dm'

export type MiscData = {
  breakLevelMulti: number[]
}

export function MiscData(): MiscData {
  return {
    breakLevelMulti: [
      -1,
      ...avatarBreakDamage.map((config) => config.BreakBaseDamage.Value),
    ],
  }
}
