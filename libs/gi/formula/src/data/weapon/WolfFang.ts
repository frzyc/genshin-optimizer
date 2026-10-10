import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WolfFang'
const skillBurst_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const skillBurst_critRate_arr = [-1, 0.02, 0.025, 0.03, 0.035, 0.04]

const {
  weapon: { refinement },
} = own
const { skillStacks, burstStacks } = allNumConditionals(key, true, 0, 4)

const dmg_ = percent(subscript(refinement, skillBurst_dmg_arr))
const critRate_ = percent(subscript(refinement, skillBurst_critRate_arr))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(dmg_),
  ownBuff.premod.dmg_.burst.add(dmg_),
  ownBuff.premod.critRate_.skill.add(prod(skillStacks, critRate_)),
  ownBuff.premod.critRate_.burst.add(prod(burstStacks, critRate_))
)
