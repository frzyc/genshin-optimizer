export type TalentSheetElementKey =
  | 'basic'
  | 'skill'
  | 'ult'
  | 'talent'
  | 'technique'
  | 'overworld'
  | 'bonusAbility1'
  | 'bonusAbility2'
  | 'bonusAbility3'
  | 'eidolon1'
  | 'eidolon2'
  | 'eidolon3'
  | 'eidolon4'
  | 'eidolon5'
  | 'eidolon6'

export function isTalentKey(
  tKey: TalentSheetElementKey
): tKey is 'basic' | 'skill' | 'ult' | 'talent' {
  return (
    ['basic', 'skill', 'ult', 'talent'] as TalentSheetElementKey[]
  ).includes(tKey)
}
