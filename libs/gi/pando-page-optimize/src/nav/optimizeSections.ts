export const OPT_SECTION_IDS = {
  character: 'opt-section-character',
  optTarget: 'opt-section-opt-target',
  eq: 'opt-section-eq',
  playstyle: 'opt-section-playstyle',
  teammates: 'opt-section-teammates',
  enemy: 'opt-section-enemy',
  mechanics: 'opt-section-mechanics',
  opt: 'opt-section-opt',
  builds: 'opt-section-builds',
} as const

export type OptimizeSectionId =
  (typeof OPT_SECTION_IDS)[keyof typeof OPT_SECTION_IDS]

export const OPT_SECTION_ORDER: OptimizeSectionId[] = [
  OPT_SECTION_IDS.character,
  OPT_SECTION_IDS.optTarget,
  OPT_SECTION_IDS.eq,
  OPT_SECTION_IDS.playstyle,
  OPT_SECTION_IDS.teammates,
  OPT_SECTION_IDS.enemy,
  OPT_SECTION_IDS.mechanics,
  OPT_SECTION_IDS.opt,
  OPT_SECTION_IDS.builds,
]

export const OPT_SECTION_I18N: Record<OptimizeSectionId, string> = {
  [OPT_SECTION_IDS.character]: 'char',
  [OPT_SECTION_IDS.optTarget]: 'optimizeTarget',
  [OPT_SECTION_IDS.eq]: 'eq',
  [OPT_SECTION_IDS.playstyle]: 'conditionals',
  [OPT_SECTION_IDS.teammates]: 'teammates',
  [OPT_SECTION_IDS.enemy]: 'enemyStats',
  [OPT_SECTION_IDS.mechanics]: 'charSheet',
  [OPT_SECTION_IDS.opt]: 'opt',
  [OPT_SECTION_IDS.builds]: 'builds',
}
