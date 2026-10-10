import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'MountainBracingBolt'
const skill_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { afterOtherSkill } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(percent(subscript(refinement, skill_dmg_arr))),
  ownBuff.premod.dmg_.skill.add(
    afterOtherSkill.ifOn(percent(subscript(refinement, dmg_arr)))
  )
)
