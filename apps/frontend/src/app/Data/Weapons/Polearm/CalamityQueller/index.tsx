import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import {
  compareEq,
  constant,
  lookup,
  prod,
  subscript,
  unequal,
} from '../../../../Formula/utils'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'CalamityQueller'
const data_gen = allStats.weapon.data[key]

const [, trm] = trans('weapon', key)

const [condStackPath, condStack] = cond(key, 'stack')
const [condOffFieldPath, condOffField] = cond(key, 'offField')

const dmg_ = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [-1, 0.032, 0.04, 0.048, 0.056, 0.064]

const dmg_Nodes = Object.fromEntries(
  allElementKeys.map((e) => [
    `${e}_dmg_`,
    subscript(input.weapon.refinement, dmg_),
  ])
)
const atkInc = prod(
  compareEq(
    condOffField,
    'on',
    constant(2, { name: trm('inactive') }),
    constant(1, { name: trm('active') })
  ),
  lookup(
    condStack,
    objKeyMap(range(1, 6), (i) => constant(i, { name: st('stacks') })),
    0
  ),
  subscript(input.weapon.refinement, atk_)
)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...dmg_Nodes,
    atk_: atkInc,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: Object.values(dmg_Nodes).map((node) => ({ node })),
    },
    {
      value: condStack,
      path: condStackPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: trm('effectName'),
      states: Object.fromEntries(
        range(1, 6).map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [
              {
                node: atkInc,
              },
            ],
          },
        ])
      ),
    },
    {
      canShow: unequal(condStack, undefined, 1),
      value: condOffField,
      path: condOffFieldPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: st('charOffField'),
      states: {
        on: {
          fields: [],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
