import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
  sum,
  tally,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'JadeVista'

const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const eleMasArr = [-1, 64, 80, 96, 112, 128]
const sameEle = sum(lookup(input.charEle, tally, naught), -1)
const diffEle = sum(
  ...allElementKeys.map((ele) => unequal(input.charEle, ele, tally[ele]))
)
const atk_ = prod(
  subscript(input.weapon.refinement, atk_arr, { unit: '%' }),
  diffEle
)
const eleMas = prod(subscript(input.weapon.refinement, eleMasArr), sameEle)
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
      fields: [{ node: atk_ }, { node: eleMas }],
    },
  ],
}
export default new WeaponSheet(sheet, data)
