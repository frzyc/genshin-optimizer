import { allElementKeys, type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/util'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ProspectorsDrill'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atk_Inc = [-1, 0.03, 0.04, 0.05, 0.06, 0.07]
const allEleInc = [-1, 0.07, 0.085, 0.1, 0.115, 0.13]
const [condStackPath, condStack] = cond(key, 'Struggle')
const atk_ = lookup(
  condStack,
  objKeyMap(range(1, 3), (i) =>
    prod(subscript(input.weapon.refinement, atk_Inc, { unit: '%' }), i)
  ),
  naught
)
const allElement_ = objKeyValMap(allElementKeys, (e) => [
  `${e}_dmg_`,
  lookup(
    condStack,
    objKeyMap(range(1, 3), (i) =>
      prod(subscript(input.weapon.refinement, allEleInc, { unit: '%' }), i)
    ),
    naught
  ),
])
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    ...allElement_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condStack,
      path: condStackPath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: objKeyMap(range(1, 3), (i) => ({
        name: st('stack', { count: i }),
        fields: [
          {
            node: atk_,
          },
          ...Object.values(allElement_).map((node) => ({ node })),
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: 15,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
