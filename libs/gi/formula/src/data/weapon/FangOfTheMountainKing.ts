import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FangOfTheMountainKing'
const skill_dmg_arr = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]

const {
  weapon: { refinement },
} = own
const { stacks } = allNumConditionals(key, true, 0, 6)
const skill_burst_dmg_ = prod(
  stacks,
  percent(subscript(refinement, skill_dmg_arr))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(skill_burst_dmg_),
  ownBuff.premod.dmg_.burst.add(skill_burst_dmg_)
)
