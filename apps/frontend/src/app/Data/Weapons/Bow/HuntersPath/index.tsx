import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'HuntersPath'
const data_gen = data_gen_json as WeaponData

const allEle_dmg_arr = [0.12, 0.15, 0.18, 0.21, 0.24]
const allEle_dmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    subscript(input.weapon.refineIndex, allEle_dmg_arr, { unit: '%' }),
  ])
)

const charged_dmgIncArr = [1.6, 2, 2.4, 2.8, 3.2]
const [condPassivePath, condPassive] = cond(key, 'passive')
const charged_dmgInc = equal(
  condPassive,
  'on',
  prod(
    subscript(input.weapon.refineIndex, charged_dmgIncArr, { unit: '%' }),
    input.total.eleMas
  )
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...allEle_dmg_,
    charged_dmgInc,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: Object.values(allEle_dmg_).map((node) => ({
        node,
      })),
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.charged'),
      states: {
        on: {
          fields: [
            {
              node: charged_dmgInc,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
            {
              text: st('charges'),
              value: 12,
            },
            {
              text: stg('cd'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
