import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BeaconOfTheReedSea'
const afterSkillAtkArr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const afterDmgAtkArr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const noShieldHpArr = [-1, 0.32, 0.4, 0.48, 0.56, 0.64]

const {
  weapon: { refinement },
} = own
const { afterSkill, afterDmg, noShield } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    afterSkill.ifOn(percent(subscript(refinement, afterSkillAtkArr)))
  ),
  ownBuff.premod.atk_.add(
    afterDmg.ifOn(percent(subscript(refinement, afterDmgAtkArr)))
  ),
  ownBuff.premod.hp_.add(
    noShield.ifOn(percent(subscript(refinement, noShieldHpArr)))
  )
)
