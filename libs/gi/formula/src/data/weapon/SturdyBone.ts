import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SturdyBone'
const normal_dmgInc_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { afterSprint } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.formula.base.normal.add(
    afterSprint.ifOn(
      prod(percent(subscript(refinement, normal_dmgInc_arr)), own.final.atk)
    )
  )
)
