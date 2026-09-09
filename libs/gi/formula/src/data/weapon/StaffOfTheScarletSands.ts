import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'StaffOfTheScarletSands'
const baseAtkArr = [-1, 0.52, 0.65, 0.78, 0.91, 1.04]
const stacksAttArr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const {
  premod: { eleMas },
  weapon: { refinement },
} = own
const { stacks } = allNumConditionals(key, true, 0, 3)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.final.atk.add(
    prod(percent(subscript(refinement, baseAtkArr)), eleMas)
  ),
  ownBuff.final.atk.add(
    prod(stacks, percent(subscript(refinement, stacksAttArr)), eleMas)
  )
)
