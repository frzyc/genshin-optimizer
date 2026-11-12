import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'

export const OPT_SECTION_IDS = {
  character: 'opt-section-character',
  optTarget: 'opt-section-opt-target',
  eq: 'opt-section-eq',
  playstyle: 'opt-section-playstyle',
  bonusStats: 'opt-section-bonus-stats',
  teammates: 'opt-section-teammates',
  enemy: 'opt-section-enemy',
  anomaly: 'opt-section-anomaly',
  mechanics: 'opt-section-mechanics',
  opt: 'opt-section-opt',
  builds: 'opt-section-builds',
} as const

export type OptimizeSectionId =
  (typeof OPT_SECTION_IDS)[keyof typeof OPT_SECTION_IDS]

const CHAR_SHEET_SECTION_KEYS = new Set<CharacterKey>([
  'Yixuan',
  'Soldier0Anby',
])

export function showsCharSheetSection(characterKey: CharacterKey) {
  return CHAR_SHEET_SECTION_KEYS.has(characterKey) || shouldShowDevComponents
}

export const OPT_SECTION_ORDER: OptimizeSectionId[] = [
  OPT_SECTION_IDS.character,
  OPT_SECTION_IDS.optTarget,
  OPT_SECTION_IDS.eq,
  OPT_SECTION_IDS.playstyle,
  OPT_SECTION_IDS.bonusStats,
  OPT_SECTION_IDS.teammates,
  OPT_SECTION_IDS.enemy,
  OPT_SECTION_IDS.anomaly,
  OPT_SECTION_IDS.mechanics,
  OPT_SECTION_IDS.opt,
  OPT_SECTION_IDS.builds,
]

export function optimizeSectionOrder(
  characterKey: CharacterKey
): OptimizeSectionId[] {
  if (showsCharSheetSection(characterKey)) return OPT_SECTION_ORDER
  return OPT_SECTION_ORDER.filter((id) => id !== OPT_SECTION_IDS.mechanics)
}

export const OPT_SECTION_I18N: Record<OptimizeSectionId, string> = {
  [OPT_SECTION_IDS.character]: 'char',
  [OPT_SECTION_IDS.optTarget]: 'optimizeTarget',
  [OPT_SECTION_IDS.eq]: 'eq',
  [OPT_SECTION_IDS.playstyle]: 'conditionals',
  [OPT_SECTION_IDS.bonusStats]: 'bonusStats',
  [OPT_SECTION_IDS.teammates]: 'teammates',
  [OPT_SECTION_IDS.enemy]: 'enemyStats',
  [OPT_SECTION_IDS.anomaly]: 'anomaly',
  [OPT_SECTION_IDS.mechanics]: 'charSheet',
  [OPT_SECTION_IDS.opt]: 'opt',
  [OPT_SECTION_IDS.builds]: 'builds',
}
