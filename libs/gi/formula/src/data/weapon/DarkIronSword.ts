import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'DarkIronSword'
const atkInc = [-1, 0.2, 0.25, 0.3, 0.35, 0.5]

const {
  weapon: { refinement },
} = own
const { Overloaded } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    Overloaded.ifOn(percent(subscript(refinement, atkInc)))
  )
)
