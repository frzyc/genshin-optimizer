import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ScionOfTheBlazingSun'
const dmgArr = [-1, 0.6, 0.75, 0.9, 1.05, 1.2]
const charged_dmg_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const {
  weapon: { refinement },
} = own
const { afterHit } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.charged.add(
    afterHit.ifOn(percent(subscript(refinement, charged_dmg_arr)))
  ),
  customDmg(
    'dmg',
    undefined,
    'elemental',
    prod(percent(subscript(refinement, dmgArr)), own.final.atk)
  )
)
