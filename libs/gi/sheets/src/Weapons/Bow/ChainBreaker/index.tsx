import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  greaterEq,
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ChainBreaker'
const [, trm] = trans('weapon', key)

const atk_arr = [-1, 0.048, 0.06, 0.072, 0.084, 0.096]
const eleMasArr = [-1, 24, 30, 36, 42, 48]

const [condNatlanOrNonElePath, condNatlanOrNonEle] = cond(key, 'natlanOrNonEle')
const charArr = range(1, 4)
const charCount = lookup(
  condNatlanOrNonEle,
  objKeyMap(charArr, (n) => constant(n)),
  naught
)

const atk_ = prod(
  subscript(input.weapon.refinement, atk_arr, { unit: '%' }),
  charCount
)
const eleMas = greaterEq(
  charCount,
  3,
  subscript(input.weapon.refinement, eleMasArr)
)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    eleMas,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('stacks')),
      value: condNatlanOrNonEle,
      path: condNatlanOrNonElePath,
      name: trm('condName'),
      states: objKeyMap(charArr, (n) => ({
        name: st('members', { count: n }),
        fields: [{ node: atk_ }, { node: eleMas }],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
