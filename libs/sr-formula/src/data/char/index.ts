import type { NonTrailblazerCharacterKey } from '@genshin-optimizer/sr-consts'
import { nonTrailblazerCharacterKeys } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { constant, prod, read, subscript, sum } from '@genshin-optimizer/pando'
import type { TaggedFormulas } from '../util'

type Promotion =
  (typeof allStats.char)[NonTrailblazerCharacterKey]['ascension'][number]
// Attach the base stats from the generated datamine
function handleCharacterGen(ck: NonTrailblazerCharacterKey): TaggedFormulas {
  const chardataGen = allStats.char[ck]
  const readAsc = read({ src: ck, q: 'ascension' }, undefined)
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl1
  const readLvl = sum(constant(-1), read({ src: ck, q: 'lvl' }, undefined))
  return [
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = chardataGen.ascension.map((p: Promotion) => p[sk].base)
      const addPerAsc = chardataGen.ascension.map((p: Promotion) => p[sk].add)
      return {
        tag: { src: ck, qt: 'base', q: sk },
        value: sum(
          subscript(readAsc, basePerAsc),
          prod(readLvl, subscript(readAsc, addPerAsc))
        ),
      }
    }),
    ...(['spd', 'crit_', 'crit_dmg_', 'taunt'] as const).map((sk) => {
      const statAsc = chardataGen.ascension.map((p: Promotion) => p[sk])
      return {
        tag: { src: ck, qt: 'base', q: sk },
        value: subscript(readAsc, statAsc),
      }
    }),
  ] as TaggedFormulas
}

const data: TaggedFormulas =
  nonTrailblazerCharacterKeys.flatMap(handleCharacterGen)

export { data }
