import {
  cmpEq,
  cmpGE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import type { LightConeDatum } from '@genshin-optimizer/sr/stats'
import type { TagMapNodeEntries } from '../util'
import { getStatFromStatKey, own, ownBuff } from '../util'

export function entriesForLightCone(
  key: LightConeKey,
  dataGen: LightConeDatum
): TagMapNodeEntries {
  const { ascension, superimpose } = own.lightCone
  // The "add" only applies to lvl - 1, since "base" is stat at lvl1
  const lvl1 = sum(own.lightCone.lvl, -1)
  const lcCount = own.common.count.sheet(key)
  return [
    // Base stats
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = dataGen.ascension.map((p) => p[sk].base)
      const addPerAsc = dataGen.ascension.map((p) => p[sk].add)
      return ownBuff.base[sk].add(
        cmpGE(
          lcCount,
          1,
          sum(
            subscript(ascension, basePerAsc),
            prod(lvl1, subscript(ascension, addPerAsc))
          )
        )
      )
    }),
    // Passive stats
    ...Object.entries(dataGen.superimpose.passiveStats).map(
      ([statKey, values]) =>
        getStatFromStatKey(ownBuff.premod, statKey).add(
          cmpGE(
            lcCount,
            1,
            cmpEq(dataGen.path, own.char.path, subscript(superimpose, values))
          )
        )
    ),
  ]
}
