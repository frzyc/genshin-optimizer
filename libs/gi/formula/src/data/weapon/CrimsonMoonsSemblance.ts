import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, cmpNE, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CrimsonMoonsSemblance'
const dmg_1Arr = [-1, 0.12, 0.16, 0.2, 0.24, 0.28]
const dmg_2Arr = [-1, 0.24, 0.32, 0.4, 0.48, 0.56]

const {
  weapon: { refinement },
} = own
const { bond } = allListConditionals(key, ['1', '2'])

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    cmpNE(bond.value, 0, percent(subscript(refinement, dmg_1Arr)))
  ),
  ownBuff.premod.dmg_.add(
    cmpEq(bond.value, 2, percent(subscript(refinement, dmg_2Arr)))
  )
)
