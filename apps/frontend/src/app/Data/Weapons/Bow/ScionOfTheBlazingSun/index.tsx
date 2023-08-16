import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ScionOfTheBlazingSun'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const dmgArr = [-1, 0.6, 0.75, 0.9, 1.05, 1.2]
const charged_dmg_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const dmg = customDmgNode(
  prod(
    subscript(input.weapon.refinement, dmgArr, { unit: '%' }),
    input.total.atk
  ),
  'elemental'
)
const [condAfterHitPath, condAfterHit] = cond(key, 'afterHit')
const charged_dmg_ = equal(
  condAfterHit,
  'on',
  subscript(input.weapon.refinement, charged_dmg_arr)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    charged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('dmg')),
      fields: [
        {
          node: infoMut(dmg, { name: trm('dmg') }),
        },
      ],
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterHitPath,
      value: condAfterHit,
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: charged_dmg_,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
