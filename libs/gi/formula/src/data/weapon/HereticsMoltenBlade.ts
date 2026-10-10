import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'HereticsMoltenBlade'
const atk_arr = [-1, 0.18, 0.225, 0.27, 0.315, 0.36]
const addl_atk_arr = [-1, 0.01, 0.0125, 0.015, 0.0175, 0.02]

const {
  weapon: { refinement },
} = own
const { passive } = allNumConditionals(key, true, 0, 18)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    sum(
      cmpGE(passive, 1, percent(subscript(refinement, atk_arr))),
      prod(passive, percent(subscript(refinement, addl_atk_arr)))
    )
  )
)
