import type { DamageType, Tag } from '@genshin-optimizer/sr/formula'

export function getVariant(tag: Tag) {
  const { q, elementalType } = tag
  if (q === 'heal' || q === 'heal_') return 'heal'
  if (elementalType) return elementalType
  // TODO: shield?
  return
}
export function isDmg(tag: Tag) {
  const { q } = tag
  return q === 'dmg'
}

export function getDmgType(tag: Tag) {
  const { damageType1, damageType2 } = tag
  const dmgType: Array<DamageType> = []
  if (!isDmg(tag)) return []
  if (damageType1) dmgType.push(damageType1)
  if (damageType2) dmgType.push(damageType2)
  return dmgType
}
