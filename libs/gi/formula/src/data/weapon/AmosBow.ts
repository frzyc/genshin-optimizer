import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'AmosBow'
const autoDmgInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const arrowDmgInc = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { StrongWilled } = allNumConditionals(key, true, 0, 5)
const auto_dmg_ = percent(subscript(refinement, autoDmgInc))
const arrow_dmg_ = prod(
  StrongWilled,
  percent(subscript(refinement, arrowDmgInc))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(auto_dmg_),
  ownBuff.premod.dmg_.charged.add(auto_dmg_),
  ownBuff.premod.dmg_.normal.add(arrow_dmg_),
  ownBuff.premod.dmg_.charged.add(arrow_dmg_)
)
