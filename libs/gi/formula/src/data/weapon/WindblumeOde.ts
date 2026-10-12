import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WindblumeOde'
const atk_s = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { WindblumeWish } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    WindblumeWish.ifOn(percent(subscript(refinement, atk_s)))
  )
)
