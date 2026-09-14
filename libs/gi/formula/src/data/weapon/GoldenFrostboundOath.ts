import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'GoldenFrostboundOath'
const selfDmg_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const teamDmg_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const {
  weapon: { refinement },
} = own
const { skillOrLc, moondrift } = allBoolConditionals(key)

const self_dmg_ = skillOrLc.ifOn(percent(subscript(refinement, selfDmg_arr)))
const team_dmg_ = skillOrLc.ifOn(
  moondrift.ifOn(percent(subscript(refinement, teamDmg_arr)))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.geo.add(self_dmg_),
  ownBuff.premod.dmg_.lunarcrystallize.add(self_dmg_),
  notOwnBuff.premod.dmg_.geo.add(team_dmg_),
  notOwnBuff.premod.dmg_.lunarcrystallize.add(team_dmg_)
)
