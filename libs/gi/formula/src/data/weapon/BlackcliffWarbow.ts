import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BlackcliffWarbow'
const atkInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { PressTheAdvantage } = allNumConditionals(key, true, 0, 3)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(PressTheAdvantage, percent(subscript(refinement, atkInc)))
  )
)
