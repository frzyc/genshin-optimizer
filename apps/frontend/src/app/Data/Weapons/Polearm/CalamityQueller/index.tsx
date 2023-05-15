import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, constant, lookup, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'CalamityQueller'
const data_gen = data_gen_json as WeaponData

const [tr] = trans('weapon', key)

const [condStacksPath, condStacks] = cond(key, 'stack')
const [condOffFieldPath, condOffField] = cond(key, 'offField')

const dmg_ = [0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [0.032, 0.04, 0.048, 0.056, 0.064]

const dmg_Nodes = Object.fromEntries(
  allElementKeys.map((e) => [
    `${e}_dmg_`,
    subscript(input.weapon.refineIndex, dmg_),
  ])
)
const atkInc = prod(
  constant(1, {}),
  lookup(
    condStacks,
    objectKeyMap(range(1, 6), (i) => constant(i, { name: st('stacks') })),
    0
  ),
  subscript(input.weapon.refineIndex, atk_, { unit: '%' })
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
      value: condStacks,
      path: condStacksPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: tr('passiveName'),
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
      canShow: equal(condStacks, '1 stack', 1),
      value: condOffField,
      path: condOffFieldPath,
      header: headerTemplate(key, st('conditional')),
      name: st('charOffField'),
      states: {
        on: {
          fields: [
            {
              node: atkInc,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
