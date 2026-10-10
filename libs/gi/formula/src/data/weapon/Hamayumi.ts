import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Hamayumi'
const normal_dmg_s = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const charged_dmg_s = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { FullDraw } = allBoolConditionals(key)
const normal_dmg_ = percent(subscript(refinement, normal_dmg_s))
const charged_dmg_ = percent(subscript(refinement, charged_dmg_s))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(normal_dmg_),
  ownBuff.premod.dmg_.charged.add(charged_dmg_),
  ownBuff.premod.dmg_.normal.add(FullDraw.ifOn(normal_dmg_)),
  ownBuff.premod.dmg_.charged.add(FullDraw.ifOn(charged_dmg_))
)
