import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FracturedHalo'
const atk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const lc_dmg_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { afterSkillBurst, afterShield } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    afterSkillBurst.ifOn(percent(subscript(refinement, atk_arr)))
  ),
  teamBuff.premod.dmg_.lunarcharged.add(
    afterSkillBurst.ifOn(
      afterShield.ifOn(percent(subscript(refinement, lc_dmg_arr)))
    )
  )
)
