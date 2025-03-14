import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from './allStats'

export function getLightConeStat(lcKey: LightConeKey) {
  return allStats.lightCone[lcKey]
}

/**
 * Creates an interpolation object for i18n'ing the datamined strings with the proper numeric values for light cone passives
 * @param lck Light cone key
 * @param superimpose Superimposition to use
 * @returns Interpolation object to be fed to translate function
 */
export function getLightConeInterpolateObject(
  lck: LightConeKey,
  superimpose: number,
) {
  return Object.fromEntries(
    allStats.lightCone[lck].superimpose.otherStats.map(
      (superimposeParams, index) => [index + 1, superimposeParams[superimpose]],
    ),
  )
}
