import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input, tally } from '../../../../Formula'
import { prod, subscript } from '../../../../Formula/utils'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'LithicSpear'
const data_gen = allStats.weapon.data[key]

const atkInc = [-1, 0.07, 0.08, 0.09, 0.1, 0.11]
const critInc = [-1, 0.03, 0.04, 0.05, 0.06, 0.07]
const atk_ = prod(
  subscript(input.weapon.refinement, atkInc, { unit: '%' }),
  tally.liyue
)
const critRate_ = prod(
  subscript(input.weapon.refinement, critInc, { unit: '%' }),
  tally.liyue
)
export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    critRate_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('stacks')),
      fields: [{ node: atk_ }, { node: critRate_ }],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
