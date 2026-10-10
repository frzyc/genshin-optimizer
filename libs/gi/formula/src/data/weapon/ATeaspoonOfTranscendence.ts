import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ATeaspoonOfTranscendence'
const atk_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const stellar_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { passive } = allNumConditionals(key, true, 0, 3)
const stellar_dmg_ = prod(passive, percent(subscript(refinement, stellar_arr)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(percent(subscript(refinement, atk_arr))),
  ownBuff.premod.dmg_.stellarconduct.add(stellar_dmg_),
  ownBuff.premod.dmg_.stellarswirl.add(stellar_dmg_)
)
