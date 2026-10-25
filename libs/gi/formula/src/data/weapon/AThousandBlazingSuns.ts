import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'AThousandBlazingSuns'
const critDMG_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const atk_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const {
  weapon: { refinement },
} = own
const { passive, nightsoul } = allBoolConditionals(key)
const nsFactor = sum(1, nightsoul.ifOn(percent(0.75)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critDMG_.add(
    passive.ifOn(prod(percent(subscript(refinement, critDMG_arr)), nsFactor))
  ),
  ownBuff.premod.atk_.add(
    passive.ifOn(prod(percent(subscript(refinement, atk_arr)), nsFactor))
  )
)
