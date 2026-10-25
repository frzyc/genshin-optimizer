import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'NewBough'
const atk_arr = [-1, 0.04, 0.05, 0.06, 0.07, 0.08]
const eleMasArr = [-1, 20, 25, 30, 35, 40]
const stellarAtk_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const stellar_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { passive } = allNumConditionals(key, true, 0, 3)
const { lockStellarRadianceSc } = allBoolConditionals(key)

const atk_normal = prod(passive, percent(subscript(refinement, atk_arr)))
const atk_stellar = prod(
  passive,
  percent(subscript(refinement, stellarAtk_arr))
)
const eleMas = prod(passive, subscript(refinement, eleMasArr))
const stellar_dmg_ = prod(
  passive,
  percent(subscript(refinement, stellar_dmg_arr))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(lockStellarRadianceSc.ifOff(atk_normal)),
  ownBuff.premod.atk_.add(lockStellarRadianceSc.ifOn(atk_stellar)),
  ownBuff.premod.eleMas.add(eleMas),
  ...allStellarReactionKeys.map((k) =>
    ownBuff.premod.dmg_[k].add(lockStellarRadianceSc.ifOn(stellar_dmg_))
  )
)
