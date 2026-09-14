import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'EngulfingLightning'
const atk = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const atkMax = [-1, 0.8, 0.9, 1, 1.1, 1.2]
const enerRech = [-1, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55]

const {
  weapon: { refinement },
} = own
const { TimelessDream } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    min(
      prod(percent(subscript(refinement, atk)), own.premod.enerRech_),
      percent(subscript(refinement, atkMax))
    )
  ),
  ownBuff.premod.enerRech_.add(
    TimelessDream.ifOn(percent(subscript(refinement, enerRech)))
  )
)
