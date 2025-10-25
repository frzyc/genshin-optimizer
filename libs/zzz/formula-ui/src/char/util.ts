import type { Attribute, DamageType, Tag } from '@genshin-optimizer/zzz/formula'

export function getVariant(tag: Tag) {
  const { attribute } = tag
  // if (q === 'heal' || q === 'heal_') return 'heal'
  if (attribute) return attribute as Attribute
  // TODO: shield?
  return
}
export function isDmg(tag: Tag) {
  const { q } = tag
  return ['standardDmg', 'anomalyDmg', 'sheerDmg'].includes(q as string)
}

export function getDmgType(tag: Tag) {
  const { damageType1, damageType2 } = tag
  const dmgType: Array<DamageType> = []
  if (!isDmg(tag)) return []
  if (damageType1) dmgType.push(damageType1 as DamageType)
  if (damageType2) dmgType.push(damageType2 as DamageType)
  return dmgType
}

// TODO: translation
export const damageTypeKeysMap: Record<DamageType, string> = {
  basic: 'Basic',
  dash: 'Dash',
  dodgeCounter: 'Dodge Counter',
  special: 'Special',
  exSpecial: 'EX Special',
  chain: 'Chain',
  ult: 'Ultimate',
  quickAssist: 'Quick Assist',
  defensiveAssist: 'Defensive Assist',
  evasiveAssist: 'Evasive Assist',
  assistFollowUp: 'Assist Follow Up',
  anomaly: 'Anomaly',
  disorder: 'Disorder',
  aftershock: 'Aftershock',
  elemental: 'Elemental',
  sheer: 'Sheer',
}
