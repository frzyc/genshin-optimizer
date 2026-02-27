import type { Attribute, DamageType, Tag } from '@genshin-optimizer/zzz/formula'
import i18n from 'i18next'

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

export const damageTypeKeysMap: Record<DamageType, string> = {
  get basic() { return i18n.t('sheet:skills.basic') },
  get dash() { return i18n.t('statKey_gen:dash') },
  get dodgeCounter() { return i18n.t('statKey_gen:dodgeCounter') },
  get special() { return i18n.t('sheet:skills.special') },
  get exSpecial() { return i18n.t('sheet:skills.exSpecial') },
  get chain() { return i18n.t('sheet:skills.chain') },
  get ult() { return i18n.t('sheet:skills.ult') },
  get entrySkill() { return i18n.t('statKey_gen:entrySkill') },
  get quickAssist() { return i18n.t('statKey_gen:quickAssist') },
  get defensiveAssist() { return i18n.t('statKey_gen:defensiveAssist') },
  get evasiveAssist() { return i18n.t('statKey_gen:evasiveAssist') },
  get assistFollowUp() { return i18n.t('sheet:skills.assistFollowUp') },
  get anomaly() { return i18n.t('statKey_gen:anomaly') },
  get disorder() { return i18n.t('statKey_gen:disorder') },
  get aftershock() { return i18n.t('sheet:skills.aftershock') },
  get elemental() { return i18n.t('statKey_gen:elemental') },
  get sheer() { return i18n.t('statKey_gen:sheer') },
}
