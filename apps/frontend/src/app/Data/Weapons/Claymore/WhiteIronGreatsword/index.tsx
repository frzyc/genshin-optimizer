import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'

import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { customHealNode } from '../../../Characters/dataUtil'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'WhiteIronGreatsword'
const data_gen = allStats.weapon.data[key]

const hpRegen = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const [condPath, condNode] = cond(key, 'CullTheWeak')
const heal = equal(
  input.weapon.key,
  key,
  equal(
    condNode,
    'on',
    customHealNode(
      prod(
        subscript(input.weapon.refinement, hpRegen, { unit: '%' }),
        input.total.hp
      )
    )
  )
)

export const data = dataObjForWeaponSheet(key, data_gen, undefined, { heal })
const sheet: IWeaponSheet = {
  document: [
    {
      value: condNode,
      path: condPath,
      name: st('afterDefeatEnemy'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: infoMut(heal, { name: stg('healing'), variant: 'heal' }),
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
