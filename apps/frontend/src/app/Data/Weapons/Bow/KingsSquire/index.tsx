import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'KingsSquire'
const data_gen = allStats.weapon.data[key]

const [condPassivePath, condPassive] = cond(key, 'passive')
const eleMasArr = [60, 80, 100, 120, 140]
const eleMas = equal(
  condPassive,
  'on',
  subscript(input.weapon.refineIndex, eleMasArr)
)
const dmg_arr = [1, 1.2, 1.4, 1.6, 1.8]
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refineIndex, dmg_arr, { unit: '%' }),
      input.total.atk
    ),
    'elemental'
  )
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      eleMas,
    },
  },
  {
    dmg,
  }
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
export default new WeaponSheet(key, sheet, data_gen, data)
