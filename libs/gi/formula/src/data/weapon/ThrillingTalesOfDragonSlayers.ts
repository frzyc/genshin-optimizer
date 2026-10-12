import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  notOwnBuff,
  own,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ThrillingTalesOfDragonSlayers'
const atkSrc = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const {
  weapon: { refinement },
} = own
const { Heritage } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  notOwnBuff.premod.atk_.addOnce(
    'ttds',
    Heritage.ifOn(percent(subscript(refinement, atkSrc))),
    destIsActive
  )
)
