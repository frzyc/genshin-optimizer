import type { CharacterKey } from '@genshin-optimizer/sr-consts'
import { allCharacterKeys } from '@genshin-optimizer/sr-consts'
import {
  constant,
  prod,
  read,
  subscript,
  sum,
} from '@genshin-optimizer/waverider'
import type { TaggedFormulas } from '../util'
import { allStats } from '@genshin-optimizer/sr-stats'

// Attach the base stats from the generated datamine
function handleCharacterGen(ck: CharacterKey): TaggedFormulas {
  const chardataGen = allStats.char[ck]
  const readAsc = read({ src: ck, q: 'ascension' }, undefined)
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl1
  const readLvl = sum(constant(-1), read({ src: ck, q: 'lvl' }, undefined))
  return [
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = chardataGen.ascension.map((p) => p[sk].base)
      const addPerAsc = chardataGen.ascension.map((p) => p[sk].add)
      return {
        tag: { src: ck, qt: 'base', q: sk },
        value: sum(
          subscript(readAsc, basePerAsc),
          prod(readLvl, subscript(readAsc, addPerAsc))
        ),
      }
    }),
    ...(['spd', 'crit_', 'crit_dmg_', 'taunt'] as const).map((sk) => {
      const statAsc = chardataGen.ascension.map((p) => p[sk])
      return {
        tag: { src: ck, qt: 'base', q: sk },
        value: subscript(readAsc, statAsc),
      }
    }),
  ]
}

const data: TaggedFormulas = allCharacterKeys.flatMap(handleCharacterGen)

export { data }
