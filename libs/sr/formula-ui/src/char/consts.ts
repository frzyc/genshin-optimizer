export const allTalentSheetElementStatBoostKey = [
  'statBoost1',
  'statBoost2',
  'statBoost3',
  'statBoost4',
  'statBoost5',
  'statBoost6',
  'statBoost7',
  'statBoost8',
  'statBoost9',
  'statBoost10',
] as const
export type TalentSheetElementStatBoostKey =
  (typeof allTalentSheetElementStatBoostKey)[number]

export const allTalentSheetElementKey = [
  'basic',
  'skill',
  'ult',
  'talent',
  'technique',
  'overworld',
  'bonusAbility1',
  'bonusAbility2',
  'bonusAbility3',
  ...allTalentSheetElementStatBoostKey,
  'eidolon1',
  'eidolon2',
  'eidolon3',
  'eidolon4',
  'eidolon5',
  'eidolon6',
] as const

export type TalentSheetElementKey = (typeof allTalentSheetElementKey)[number]

export function isTalentKey(
  tKey: TalentSheetElementKey
): tKey is 'basic' | 'skill' | 'ult' | 'talent' {
  return (
    ['basic', 'skill', 'ult', 'talent'] as TalentSheetElementKey[]
  ).includes(tKey)
}
