import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SilvershowerHeartstrings'
const stackHp_arrs = [
  [-1, 0.12, 0.15, 0.18, 0.21, 0.24],
  [-1, 0.24, 0.3, 0.36, 0.42, 0.48],
  [-1, 0.4, 0.5, 0.6, 0.7, 0.8],
]
const burst_critRate_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const blessingKeys = ['1', '2', '3'] as const

const {
  weapon: { refinement },
} = own
const { blessingStacks } = allListConditionals(key, [...blessingKeys])

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.hp_.add(
    lookup(
      subscript(blessingStacks.value, ['', ...blessingKeys]),
      {
        '1': percent(subscript(refinement, stackHp_arrs[0])),
        '2': percent(subscript(refinement, stackHp_arrs[1])),
        '3': percent(subscript(refinement, stackHp_arrs[2])),
      },
      0
    )
  ),
  ownBuff.premod.critRate_.burst.add(
    lookup(
      subscript(blessingStacks.value, ['', ...blessingKeys]),
      { '3': percent(subscript(refinement, burst_critRate_arr)) },
      0
    )
  )
)
