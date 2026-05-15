import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'

export const allTalentSheetElementKey = [
  ...allSkillKeys,
  'core',
  'potential',
  'm1',
  'm2',
  'm3',
  'm4',
  'm5',
  'm6',
] as const
export type TalentSheetElementKey = (typeof allTalentSheetElementKey)[number]

export type CharUISheet = UISheet<TalentSheetElementKey>
