import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BeyondTheChrysalis'
const critDMG_arr = [-1, 0.56, 0.72, 0.88, 1.04, 1.2]
const stellarswirl_dmg_arr = [-1, 0.36, 0.45, 0.54, 0.63, 0.72]

const {
  weapon: { refinement },
} = own
const { devotion, defiance } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critDMG_.add(
    devotion.ifOn(percent(subscript(refinement, critDMG_arr)))
  ),
  ownBuff.premod.dmg_.stellarswirl.add(
    defiance.ifOn(percent(subscript(refinement, stellarswirl_dmg_arr)))
  )
)
