import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SplendorOfTranquilWaters'
const skill_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const hp_arr = [-1, 0.14, 0.175, 0.21, 0.245, 0.28]

const {
  weapon: { refinement },
} = own
const { selfHpChange } = allNumConditionals(key, true, 0, 3)
const { teamHpChange } = allNumConditionals(key, true, 0, 2)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(
    prod(selfHpChange, percent(subscript(refinement, skill_dmg_arr)))
  ),
  ownBuff.premod.hp_.add(
    prod(teamHpChange, percent(subscript(refinement, hp_arr)))
  )
)
