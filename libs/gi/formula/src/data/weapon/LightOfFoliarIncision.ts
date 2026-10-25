import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'LightOfFoliarIncision'
const dmgIncArr = [-1, 1.2, 1.5, 1.8, 2.1, 2.4]

const {
  weapon: { refinement },
} = own
const { afterNormalEle } = allBoolConditionals(key)

const dmgInc = afterNormalEle.ifOn(
  prod(percent(subscript(refinement, dmgIncArr)), own.final.eleMas)
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.formula.base.normal.add(dmgInc),
  ownBuff.formula.base.skill.add(dmgInc)
)
