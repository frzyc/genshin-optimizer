import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'StarsealedEdict'
// Base critDMG_ is refinementBonus, already applied by entriesForWeapon.
const eleMasArr = [-1, 48, 60, 72, 84, 96]
const eleMasStackArr = [-1, 24, 30, 36, 42, 48]
const critDMGRadiance_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
// WR cond(key, 'skill') `'on'`; lookup cond(key, 'stacks') 1..3
const { skill } = allBoolConditionals(key)
const { stacks } = allNumConditionals(key, true, 0, 3)

const skillOn = skill.ifOn(1)
const eleMas = prod(skillOn, subscript(refinement, eleMasArr))
const eleMasStack = prod(skillOn, stacks, subscript(refinement, eleMasStackArr))
// WR equal(input.flags.radiance, 'sc'). Characters write own.common.radianceSc.
const critDMGStack_ = prod(
  skillOn,
  stacks,
  cmpGE(
    own.common.radianceSc,
    1,
    percent(subscript(refinement, critDMGRadiance_arr))
  )
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(eleMas),
  ownBuff.premod.eleMas.add(eleMasStack),
  ownBuff.premod.critDMG_.add(critDMGStack_)
)
