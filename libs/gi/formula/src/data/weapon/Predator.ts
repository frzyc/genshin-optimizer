import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, prod } from '@genshin-optimizer/pando/engine'
import { isActive } from '../common/conds'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Predator'
const { PressTheAdvantage } = allNumConditionals(key, true, 0, 2)
const stack_dmg_ = prod(PressTheAdvantage, percent(0.1))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk.add(
    isActive.ifOn(lookup(own.char.charKey, { Aloy: 66 }, 0))
  ),
  ownBuff.premod.dmg_.normal.add(stack_dmg_),
  ownBuff.premod.dmg_.charged.add(stack_dmg_)
)
