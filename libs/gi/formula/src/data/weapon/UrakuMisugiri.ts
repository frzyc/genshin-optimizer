import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'UrakuMisugiri'
const normal_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const skill_dmg_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const {
  weapon: { refinement },
} = own
const { teamGeo } = allBoolConditionals(key)

const normal_dmg_ = percent(subscript(refinement, normal_dmg_arr))
const skill_dmg_ = percent(subscript(refinement, skill_dmg_arr))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(normal_dmg_),
  ownBuff.premod.dmg_.skill.add(skill_dmg_),
  ownBuff.premod.dmg_.normal.add(teamGeo.ifOn(normal_dmg_)),
  ownBuff.premod.dmg_.skill.add(teamGeo.ifOn(skill_dmg_))
)
