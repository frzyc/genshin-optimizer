import { prod, subscript, sum } from '@genshin-optimizer/pando'
import type { LightConeKey } from '@genshin-optimizer/sr-consts'
import { allLightConeKeys } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { register, self, selfBuff, type TagMapNodeEntries } from '../util'

// Attach the base stats from the generated datamine
export function lightConeBaseStats(src: LightConeKey): TagMapNodeEntries {
  const dataGen = allStats.lightCone[src]
  const { ascension } = self.lightCone
  // The "add" only applies to lvl - 1, since "base" is stat at lvl1
  const lvl1 = sum(self.lightCone.lvl, -1)
  return register(src, [
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = dataGen.ascension.map((p) => p[sk].base)
      const addPerAsc = dataGen.ascension.map((p) => p[sk].add)
      return selfBuff.stat[sk].add(
        sum(
          subscript(ascension, basePerAsc),
          prod(lvl1, subscript(ascension, addPerAsc))
        )
      )
    }),
  ])
}
const data: TagMapNodeEntries = allLightConeKeys.flatMap(lightConeBaseStats)
export default data
