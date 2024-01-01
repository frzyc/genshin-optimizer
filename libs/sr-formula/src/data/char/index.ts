import { constant, prod, subscript, sum } from '@genshin-optimizer/pando'
import type { NonTrailblazerCharacterKey } from '@genshin-optimizer/sr-consts'
import { nonTrailblazerCharacterKeys } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { register, self, selfBuff, type TagMapNodeEntries } from '../util'
import March7th from './March7th'

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
      return selfBuff.base[sk].add(
        sum(
          subscript(ascension, basePerAsc),
          prod(readLvl, subscript(ascension, addPerAsc))
        )
      )
    }),
    ...(['crit_', 'crit_dmg_', 'spd'] as const).map((sk) => {
      const statAsc = chardataGen.ascension.map((p) => p[sk])
      switch (sk) {
        case 'crit_':
        case 'crit_dmg_':
          return selfBuff.premod[sk].add(subscript(ascension, statAsc))
        case 'spd':
          return selfBuff.base[sk].add(subscript(ascension, statAsc))
      }
    }),
  ])
}

const data: TagMapNodeEntries[] = [
  nonTrailblazerCharacterKeys
    .filter((k) => k !== 'March7th')
    .flatMap(handleCharacterGen),
  March7th,
]
export default data.flat()
