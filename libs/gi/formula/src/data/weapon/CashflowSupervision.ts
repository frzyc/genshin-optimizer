import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CashflowSupervision'
const normal_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const charged_dmg_arr = [-1, 0.14, 0.175, 0.21, 0.245, 0.28]
const stellarconduct_dmg_arr = [-1, 0.14, 0.175, 0.21, 0.245, 0.28]
const atkSPD_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { hpChanges } = allNumConditionals(key, true, 0, 3)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(
    prod(hpChanges, percent(subscript(refinement, normal_dmg_arr)))
  ),
  ownBuff.premod.dmg_.charged.add(
    prod(hpChanges, percent(subscript(refinement, charged_dmg_arr)))
  ),
  ownBuff.premod.dmg_.stellarconduct.add(
    prod(hpChanges, percent(subscript(refinement, stellarconduct_dmg_arr)))
  ),
  ownBuff.premod.atkSPD_.add(
    cmpEq(hpChanges, 3, percent(subscript(refinement, atkSPD_arr)))
  )
)
