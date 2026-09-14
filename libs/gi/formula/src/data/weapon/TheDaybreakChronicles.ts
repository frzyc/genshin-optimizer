import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheDaybreakChronicles'
const dmg_arr = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]

const {
  weapon: { refinement },
} = own
const { passive } = allNumConditionals(key, true, 0, 6)
const move_dmg_ = prod(passive, percent(subscript(refinement, dmg_arr)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(move_dmg_),
  ownBuff.premod.dmg_.skill.add(move_dmg_),
  ownBuff.premod.dmg_.burst.add(move_dmg_)
)
