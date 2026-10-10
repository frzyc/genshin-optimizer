import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ChainBreaker'
const atk_arr = [-1, 0.048, 0.06, 0.072, 0.084, 0.096]
const eleMasArr = [-1, 24, 30, 36, 42, 48]

const {
  weapon: { refinement },
} = own
const { natlanOrNonEle } = allNumConditionals(key, true, 0, 4)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(percent(subscript(refinement, atk_arr)), natlanOrNonEle)
  ),
  ownBuff.premod.eleMas.add(
    cmpGE(natlanOrNonEle, 3, subscript(refinement, eleMasArr))
  )
)
