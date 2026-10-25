import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'DodocoTales'
const chargedDmgInc = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const atkInc = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { DodoventureNormal, DodoventureCharged } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.charged.add(
    DodoventureNormal.ifOn(percent(subscript(refinement, chargedDmgInc)))
  ),
  ownBuff.premod.atk_.add(
    DodoventureCharged.ifOn(percent(subscript(refinement, atkInc)))
  )
)
