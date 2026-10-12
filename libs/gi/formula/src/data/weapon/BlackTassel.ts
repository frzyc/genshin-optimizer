import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BlackTassel'
const dmgInc = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { PressTheAdvantage } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    PressTheAdvantage.ifOn(percent(subscript(refinement, dmgInc)))
  )
)
