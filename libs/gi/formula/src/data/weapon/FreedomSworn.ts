import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, percent, register, teamBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FreedomSworn'
const autoSrc = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const atk_Src = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const {
  weapon: { refinement },
} = own
const { MillennialMovement } = allBoolConditionals(key)
const atk_ = MillennialMovement.ifOn(percent(subscript(refinement, atk_Src)))
const auto_dmg_ = MillennialMovement.ifOn(
  percent(subscript(refinement, autoSrc))
)

export default register(
  key,
  entriesForWeapon(key),
  teamBuff.premod.atk_.addOnce('millenialatk', atk_),
  teamBuff.premod.dmg_.normal.add(auto_dmg_),
  teamBuff.premod.dmg_.charged.add(auto_dmg_),
  teamBuff.premod.dmg_.plunging.add(auto_dmg_)
)
