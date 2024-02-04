import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input, tally } from '../../../../Formula'
import { greaterEq, subscript, unequal } from '../../../../Formula/utils'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'BalladOfTheFjords'
const data_gen = allStats.weapon.data[key]

const eleMasArr = [-1, 120, 150, 180, 210, 240]
const eleMas = greaterEq(
  tally.ele,
  3,
  subscript(input.weapon.refinement, eleMasArr)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('talents.passive')),
      canShow: unequal(eleMas, undefined, 1),
      fields: [
        {
          node: eleMas,
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
