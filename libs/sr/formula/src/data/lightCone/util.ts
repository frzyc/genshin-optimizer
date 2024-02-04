import { cmpEq, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import type { LightConeDatum } from '@genshin-optimizer/sr/stats'
import type { TagMapNodeEntries } from '../util'
import { getStatFromStatKey, self, selfBuff } from '../util'

export function entriesForLightCone(
  dataGen: LightConeDatum
): TagMapNodeEntries {
  const { ascension, superimpose } = self.lightCone
  // The "add" only applies to lvl - 1, since "base" is stat at lvl1
  const lvl1 = sum(self.lightCone.lvl, -1)
  return [
    // Base stats
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = dataGen.ascension.map((p) => p[sk].base)
      const addPerAsc = dataGen.ascension.map((p) => p[sk].add)
      return selfBuff.base[sk].add(
        sum(
          subscript(ascension, basePerAsc),
          prod(lvl1, subscript(ascension, addPerAsc))
        )
      )
    }),
    // Passive stats
    ...Object.entries(dataGen.superimpose.passiveStats).map(
      ([statKey, values]) =>
        getStatFromStatKey(selfBuff.premod, statKey).add(
          cmpEq(dataGen.path, self.char.path, subscript(superimpose, values))
        )
    ),
  ]
}
