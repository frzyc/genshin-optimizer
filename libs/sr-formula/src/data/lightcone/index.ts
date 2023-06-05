import { CharacterKey, LightConeKey } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import {
  constant,
  prod,
  read,
  subscript,
  sum,
} from '@genshin-optimizer/waverider'
import type { TaggedFormulas } from '../util'

// Attach the base stats from the generated datamine
export function handleLightConeGen(
  lck: LightConeKey,
  dest: CharacterKey
): TaggedFormulas {
  const lcDataGen = allStats.lightcone[lck]
  const readAsc = read({ src: lck, q: 'ascension' }, undefined)
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl1
  const readLvl = sum(constant(-1), read({ src: lck, q: 'lvl' }, undefined))
  return [
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = lcDataGen.ascension.map((p) => p[sk].base)
      const addPerAsc = lcDataGen.ascension.map((p) => p[sk].add)
      return {
        tag: { src: lck, dest, qt: 'base', q: sk },
        value: sum(
          subscript(readAsc, basePerAsc),
          prod(readLvl, subscript(readAsc, addPerAsc))
        ),
      }
    }),
  ]
}
