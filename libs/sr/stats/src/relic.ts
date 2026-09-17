import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from './allStats'

export function getRelicStat(relicKey: RelicSetKey) {
  return allStats.relic[relicKey]
}

/**
 * Creates an interpolation object for i18n'ing the datamined strings with the proper numeric values for relic passives
 * @param rk Relic set key
 * @param numRequired Number of required relics for stats
 * @returns Interpolation object to be fed to translate function
 */
export function getRelicInterpolateObject(rk: RelicSetKey, numRequired: 2 | 4) {
  const setEffectIndex = numRequired === 2 ? 0 : 1
  return Object.fromEntries(
    allStats.relic[rk].setEffects[setEffectIndex].otherStats.map(
      (param, index) => [index + 1, param]
    )
  )
}
