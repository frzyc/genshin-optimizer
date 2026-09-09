import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SkyriderSword'
const bonusInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { Determination } = allBoolConditionals(key)

const inc = Determination.ifOn(percent(subscript(refinement, bonusInc)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(inc),
  ownBuff.premod.moveSPD_.add(inc)
)
