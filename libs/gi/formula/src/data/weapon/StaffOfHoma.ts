import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'StaffOfHoma'
const atkInc = [-1, 0.008, 0.01, 0.012, 0.014, 0.016]
const lowHpAtkInc = [-1, 0.01, 0.012, 0.014, 0.016, 0.018]

const {
  premod: { hp },
  weapon: { refinement },
} = own
const { RecklessCinnabar } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.final.atk.add(prod(percent(subscript(refinement, atkInc)), hp)),
  ownBuff.final.atk.add(
    RecklessCinnabar.ifOn(prod(percent(subscript(refinement, lowHpAtkInc)), hp))
  )
)
