import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'QuantumCatalyst'
const enerRech_arr = [-1, 0.18, 0.225, 0.27, 0.315, 0.36]
const normCharged_dmgIncArr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const eleMas_arr = [-1, 10, 12, 14, 16, 18]

const {
  weapon: { refinement },
} = own
const { stacks } = allNumConditionals(key, true, 0, 5)

const dmgInc = prod(
  percent(subscript(refinement, normCharged_dmgIncArr)),
  own.final.eleMas
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.enerRech_.add(percent(subscript(refinement, enerRech_arr))),
  ownBuff.formula.base.normal.add(dmgInc),
  ownBuff.formula.base.charged.add(dmgInc),
  ownBuff.premod.eleMas.add(prod(stacks, subscript(refinement, eleMas_arr)))
)
