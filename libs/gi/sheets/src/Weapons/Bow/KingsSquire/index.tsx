import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'KingsSquire'

const [condPassivePath, condPassive] = cond(key, 'passive')
const eleMasArr = [-1, 60, 80, 100, 120, 140]
const eleMas = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, eleMasArr),
)
const dmg_arr = [-1, 1, 1.2, 1.4, 1.6, 1.8]
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmg_arr, { unit: '%' }),
      input.total.atk,
    ),
    'elemental',
  ),
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      eleMas,
    },
  },
  {
    dmg,
  },
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skillOrBurst'),
      states: {
        on: {
          fields: [
            {
              node: eleMas,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 20,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
