import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PrototypeCrescent'
const atk_s = [-1, 0.36, 0.45, 0.54, 0.63, 0.72]

const {
  weapon: { refinement },
} = own
const { Unreturning } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    Unreturning.ifOn(percent(subscript(refinement, atk_s)))
  ),
  ownBuff.premod.moveSPD_.add(Unreturning.ifOn(percent(0.1)))
)
