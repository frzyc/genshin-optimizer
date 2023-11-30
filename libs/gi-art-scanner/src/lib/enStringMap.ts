import type { ElementWithPhyKey } from '@genshin-optimizer/consts'

// Store the english translations to use with artifact scanner

const elementalData: Record<ElementWithPhyKey, string> = {
  physical: 'Physical',
  anemo: 'Anemo',
  geo: 'Geo',
  electro: 'Electro',
  hydro: 'Hydro',
  pyro: 'Pyro',
  cryo: 'Cryo',
  dendro: 'Dendro',
} as const

export const statMap = {
  hp: 'HP',
  hp_: 'HP',
  atk: 'ATK',
  atk_: 'ATK',
  def: 'DEF',
  def_: 'DEF',
  eleMas: 'Elemental Mastery',
  enerRech_: 'Energy Recharge',
  critRate_: 'Crit Rate',
  critDMG_: 'Crit DMG',
  heal_: 'Healing Bonus',
} as Record<string, string>

Object.entries(elementalData).forEach(([e, name]) => {
  statMap[`${e}_dmg_`] = `${name} DMG Bonus`
})

export const artSlotNames = {
  flower: 'Flower of Life',
  plume: 'Plume of Death',
  sands: 'Sands of Eon',
  goblet: 'Goblet of Eonothem',
  circlet: 'Circlet of Logos',
}
