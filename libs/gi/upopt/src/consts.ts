// Weight data from genshin-impact wiki:

import type { MainStatKey } from '@genshin-optimizer/gi/consts'

// https://genshin-impact.fandom.com/wiki/Artifact/Distribution
export const substatWeights = {
  hp: 6,
  atk: 6,
  def: 6,
  hp_: 4,
  atk_: 4,
  def_: 4,
  eleMas: 4,
  enerRech_: 4,
  critRate_: 3,
  critDMG_: 3,
}

export const FlowerMainStatProbs = {
  hp: 1,
} as Record<MainStatKey, number>

export const PlumeMainStatProbs = {
  atk: 1,
} as Record<MainStatKey, number>

export const SandsMainStatProbs = {
  hp_: 80 / 300,
  atk_: 80 / 300,
  def_: 80 / 300,
  eleMas: 30 / 300,
  enerRech_: 30 / 300,
} as Record<MainStatKey, number>

export const GobletMainStatProbs = {
  hp_: 77 / 400,
  def_: 76 / 400,
  atk_: 77 / 400,
  eleMas: 10 / 400,
  physical_dmg_: 20 / 400,
  anemo_dmg_: 20 / 400,
  geo_dmg_: 20 / 400,
  electro_dmg_: 20 / 400,
  hydro_dmg_: 20 / 400,
  pyro_dmg_: 20 / 400,
  cryo_dmg_: 20 / 400,
  dendro_dmg_: 20 / 400,
} as Record<MainStatKey, number>

export const CircletMainStatProbs = {
  hp_: 22 / 100,
  def_: 22 / 100,
  atk_: 22 / 100,
  eleMas: 4 / 100,
  critRate_: 10 / 100,
  critDMG_: 10 / 100,
  heal_: 10 / 100,
} as Record<MainStatKey, number>

export const allMainStatProbs = {
  flower: FlowerMainStatProbs,
  plume: PlumeMainStatProbs,
  sands: SandsMainStatProbs,
  goblet: GobletMainStatProbs,
  circlet: CircletMainStatProbs,
}
