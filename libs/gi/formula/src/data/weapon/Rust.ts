import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Rust'
const normal_dmg_s = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(percent(subscript(refinement, normal_dmg_s))),
  ownBuff.premod.dmg_.charged.add(percent(-0.1))
)
