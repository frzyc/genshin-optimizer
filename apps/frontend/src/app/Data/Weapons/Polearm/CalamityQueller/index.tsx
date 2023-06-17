import { input } from '../../../../Formula'
import {
  equal,
  unequal,
  constant,
  lookup,
  prod,
  sum,
  subscript,
} from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { allElementKeys } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'CalamityQueller'
const data_gen = allStats.weapon.data[key]

const [, trm] = trans('weapon', key)

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
const atkInc = {
  ...prod(
    lookup(
      condStacks,
      objectKeyMap(range(1, 6), (i) => constant(i, { name: st('stacks') })),
      0
    ),
    subscript(input.weapon.refineIndex, atk_)
  ),
  info: KeyMap.info('atk_'),
}
const atkIncOffField = equal(condOffField, 'on', atkInc, KeyMap.info('atk_'))
export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...dmg_Nodes,
    atk_: sum(atkInc, atkIncOffField),
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
      canShow: unequal(condStacks, undefined, 1),
      value: condOffField,
      path: condOffFieldPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: st('charOffField'),
      states: {
        on: {
          fields: [
            {
              node: atkIncOffField,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
