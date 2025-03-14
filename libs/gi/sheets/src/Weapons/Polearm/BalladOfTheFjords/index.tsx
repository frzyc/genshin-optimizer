import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  greaterEq,
  input,
  subscript,
  tally,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'BalladOfTheFjords'

const eleMasArr = [-1, 120, 150, 180, 210, 240]
const eleMas = greaterEq(
  tally.ele,
  3,
  subscript(input.weapon.refinement, eleMasArr),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('talents.passive')),
      canShow: unequal(eleMas, 0, 1),
      fields: [
        {
          node: eleMas,
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
