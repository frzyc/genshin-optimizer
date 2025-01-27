// Store the english translations to use with scanner

const elementalData: Record<string, string> = {
  electric: 'Electric',
  fire: 'Fire',
  ice: 'Ice',
  physical: 'Physical',
  ether: 'Ether',
} as const

export const statMapEngMap = {
  hp: 'HP',
  hp_: 'HP',
  atk: 'ATK',
  atk_: 'ATK',
  def: 'DEF',
  def_: 'DEF',
  pen: 'PEN',
  pen_: 'PEN Ratio',
  crit_: 'CRIT Rate',
  crit_dmg_: 'CRIT DMG',
  enerRegen_: 'Energy Regen',
  impact_: 'Impact',
  anomMas: 'Anomaly Mastery',
  anomMas_: 'Anomaly Mastery',
  anomProf: 'Anomaly Proficiency',
} as Record<string, string>

Object.entries(elementalData).forEach(([e, name]) => {
  statMapEngMap[`${e}_dmg_`] = `${name} DMG Bonus`
})
