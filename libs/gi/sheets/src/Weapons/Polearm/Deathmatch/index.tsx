import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  lookup,
  naught,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Deathmatch'

const [, trm] = trans('weapon', key)

const [condStackPath, condStack] = cond(key, 'stack')
const atkDefInc = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const atkInc = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const atk_ = lookup(
  condStack,
  {
    oneOrNone: subscript(input.weapon.refinement, atkInc, { unit: '%' }),
    moreThanOne: subscript(input.weapon.refinement, atkDefInc, { unit: '%' }),
  },
  naught,
)
const def_ = equal(
  condStack,
  'moreThanOne',
  subscript(input.weapon.refinement, atkDefInc, { unit: '%' }),
)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    def_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condStack,
      path: condStackPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: {
        oneOrNone: {
          name: '≤1',
          fields: [{ node: atk_ }, { node: def_ }],
        },
        moreThanOne: {
          name: '≥2',
          fields: [{ node: atk_ }, { node: def_ }],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
