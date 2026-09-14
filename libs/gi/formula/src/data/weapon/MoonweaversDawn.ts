import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'MoonweaversDawn'
const burst_dmg_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const highEnergyBurst_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const lowEnergyBurst_dmg_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const {
  weapon: { refinement },
} = own
const { energy } = allListConditionals(key, ['60', '40'])

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.burst.add(percent(subscript(refinement, burst_dmg_arr))),
  ownBuff.premod.dmg_.burst.add(
    cmpEq(
      energy.value,
      1,
      percent(subscript(refinement, highEnergyBurst_dmg_arr))
    )
  ),
  ownBuff.premod.dmg_.burst.add(
    cmpEq(
      energy.value,
      2,
      percent(subscript(refinement, lowEnergyBurst_dmg_arr))
    )
  )
)
