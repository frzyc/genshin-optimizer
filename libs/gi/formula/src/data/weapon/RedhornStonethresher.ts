import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'RedhornStonethresher'
const normal_dmg_Src = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const charged_dmg_Src = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.formula.base.normal.add(
    prod(percent(subscript(refinement, normal_dmg_Src)), own.premod.def)
  ),
  ownBuff.formula.base.charged.add(
    prod(percent(subscript(refinement, charged_dmg_Src)), own.premod.def)
  )
)
