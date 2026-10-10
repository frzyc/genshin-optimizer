import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ClashOfKings'
const atk_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const eleMasArr = [-1, 100, 125, 150, 175, 200]

const {
  weapon: { refinement },
} = own
const { skill } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(skill.ifOn(percent(subscript(refinement, atk_arr)))),
  ownBuff.premod.eleMas.add(skill.ifOn(subscript(refinement, eleMasArr)))
)
