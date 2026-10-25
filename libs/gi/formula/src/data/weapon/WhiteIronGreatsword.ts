import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, customHeal, own, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WhiteIronGreatsword'
const hpRegen = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { CullTheWeak } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  customHeal('heal', prod(subscript(refinement, hpRegen), own.final.hp), {
    cond: cmpGE(CullTheWeak.ifOn(1), 1, 'infer', ''),
  })
)
