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
  return ['standardDmg', 'anomalyDmg'].includes(q as string)
}

export function getDmgType(tag: Tag) {
  const { damageType1, damageType2 } = tag
  const dmgType: Array<DamageType> = []
  if (!isDmg(tag)) return []
  if (damageType1) dmgType.push(damageType1 as DamageType)
  if (damageType2) dmgType.push(damageType2 as DamageType)
  return dmgType
}
