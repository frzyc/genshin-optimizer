import type {
  BonusAbilityKey,
  EidolonKey,
  StatBoostKey,
} from '@genshin-optimizer/sr/consts'

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
export function isTalentSheetElementStatBoostKey(
  key: string
): key is TalentSheetElementStatBoostKey {
  return allTalentSheetElementStatBoostKey.includes(
    key as TalentSheetElementStatBoostKey
  )
}

export const allTalentSheetElementEidolonKey = [
  'eidolon1',
  'eidolon2',
  'eidolon3',
  'eidolon4',
  'eidolon5',
  'eidolon6',
] as const
export type TalentSheetElementEidolonKey =
  (typeof allTalentSheetElementEidolonKey)[number]
export function isTalentSheetElementEidolonKey(
  key: string
): key is TalentSheetElementEidolonKey {
  return allTalentSheetElementEidolonKey.includes(
    key as TalentSheetElementEidolonKey
  )
}
export const allTalentSheetElementBonusAbilityKey = [
  'bonusAbility1',
  'bonusAbility2',
  'bonusAbility3',
] as const
export type TalentSheetElementBonusAbilityKey =
  (typeof allTalentSheetElementBonusAbilityKey)[number]
export function isTalentSheetElementBonusAbilityKey(
  key: string
): key is TalentSheetElementBonusAbilityKey {
  return allTalentSheetElementBonusAbilityKey.includes(
    key as TalentSheetElementBonusAbilityKey
  )
}

export const allTalentSheetElementKey = [
  'basic',
  'skill',
  'ult',
  'talent',
  'technique',
  'overworld',
  ...allTalentSheetElementBonusAbilityKey,
  ...allTalentSheetElementStatBoostKey,
  ...allTalentSheetElementEidolonKey,
] as const

export type TalentSheetElementKey = (typeof allTalentSheetElementKey)[number]

export function isTalentKey(
  tKey: TalentSheetElementKey
): tKey is 'basic' | 'skill' | 'ult' | 'talent' {
  return (
    ['basic', 'skill', 'ult', 'talent'] as TalentSheetElementKey[]
  ).includes(tKey)
}

export function getStatBoostKey(
  key: TalentSheetElementStatBoostKey
): StatBoostKey {
  return parseInt(key.split('statBoost')[1] ?? '1') as StatBoostKey
}

export function getEidolonKey(key: TalentSheetElementEidolonKey): EidolonKey {
  return parseInt(key.split('eidolon')[1] ?? '1') as EidolonKey
}

export function getBonusAbilityKey(
  key: TalentSheetElementBonusAbilityKey
): BonusAbilityKey {
  return parseInt(key.split('bonusAbility')[1] ?? '1') as BonusAbilityKey
}
