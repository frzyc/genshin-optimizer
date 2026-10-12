import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CalamityOfEshu'
const dmg_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const critRate_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

const dmg_ = passive.ifOn(percent(subscript(refinement, dmg_arr)))
const critRate_ = passive.ifOn(percent(subscript(refinement, critRate_arr)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(dmg_),
  ownBuff.premod.dmg_.charged.add(dmg_),
  ownBuff.premod.critRate_.normal.add(critRate_),
  ownBuff.premod.critRate_.charged.add(critRate_)
)
