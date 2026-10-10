export const allTalentSheetElementKey = [
  'auto',
  'skill',
  'burst',
  'sprint',
  'passive',
  'passive1',
  'passive2',
  'passive3',
  'constellation1',
  'constellation2',
  'constellation3',
  'constellation4',
  'constellation5',
  'constellation6',
] as const
export type TalentSheetElementKey = (typeof allTalentSheetElementKey)[number]
