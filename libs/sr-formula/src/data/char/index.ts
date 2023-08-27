import { constant, prod, subscript, sum } from '@genshin-optimizer/pando'
import type { NonTrailblazerCharacterKey } from '@genshin-optimizer/sr-consts'
import { nonTrailblazerCharacterKeys } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { register, self, selfBuff, type TagMapNodeEntries } from '../util'

// Attach the base stats from the generated datamine
function handleCharacterGen(
  src: NonTrailblazerCharacterKey
): TagMapNodeEntries {
  const chardataGen = allStats.char[src]
  const { ascension } = self.char
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl 1
  const readLvl = sum(constant(-1), self.char.lvl)
  return register(src, [
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = chardataGen.ascension.map((p) => p[sk].base)
      const addPerAsc = chardataGen.ascension.map((p) => p[sk].add)
      return selfBuff.stat[sk].add(
        sum(
          subscript(ascension, basePerAsc),
          prod(readLvl, subscript(ascension, addPerAsc))
        )
      )
    }),
    ...(['spd', 'crit_', 'crit_dmg_', 'taunt'] as const).map((sk) => {
      const statAsc = chardataGen.ascension.map((p) => p[sk])
      return selfBuff.stat[sk].add(subscript(ascension, statAsc))
    }),
  ])
}

const data: TagMapNodeEntries =
  nonTrailblazerCharacterKeys.flatMap(handleCharacterGen)
export default data
