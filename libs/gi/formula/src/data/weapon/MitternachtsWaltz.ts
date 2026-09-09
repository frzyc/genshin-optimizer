import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'MitternachtsWaltz'
const skill_dmg_s = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const normal_dmg_s = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const {
  weapon: { refinement },
} = own
const { EvernightDuetSkill, EvernightDuetNormal } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(
    EvernightDuetSkill.ifOn(percent(subscript(refinement, skill_dmg_s)))
  ),
  ownBuff.premod.dmg_.normal.add(
    EvernightDuetNormal.ifOn(percent(subscript(refinement, normal_dmg_s)))
  )
)
