import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { notOwnBuff, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'XiphosMoonlight'
const enerRech_arr = [-1, 0.00036, 0.00045, 0.00054, 0.00063, 0.00072]

const {
  weapon: { refinement },
} = own
const selfEnerRech_ = prod(
  percent(subscript(refinement, enerRech_arr)),
  own.premod.eleMas
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.final.enerRech_.add(selfEnerRech_),
  // WR unequal(charKey, target.charKey): teammates always, unlike Evenstar/Makhaira.
  notOwnBuff.final.enerRech_.add(prod(percent(0.3), selfEnerRech_))
)
