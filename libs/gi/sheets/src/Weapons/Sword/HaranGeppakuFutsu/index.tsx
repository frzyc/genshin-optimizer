import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'HaranGeppakuFutsu'
const [, trm] = trans('weapon', key)

const passiveRefine = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const stack_normal_dmg_ = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const [condPath, condNode] = cond(key, 'HonedFlow')
const passive_dmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    subscript(input.weapon.refinement, passiveRefine, { path: `${ele}_dmg_` }),
  ]),
)
const normal_dmg_ = lookup(
  condNode,
  objKeyMap(range(1, 2), (i) =>
    prod(i, subscript(input.weapon.refinement, stack_normal_dmg_)),
  ),
  naught,
)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    ...passive_dmg_,
    normal_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        // Passive
        ...allElementKeys.map((ele) => {
          return { node: passive_dmg_[`${ele}_dmg_`] }
        }),
      ],
    },
    {
      value: condNode,
      path: condPath,
      name: trm('consumed'),
      header: headerTemplate(key, st('conditional')),
      states: objKeyMap(range(1, 2), (i) => ({
        name: st('stack', { count: i }),
        fields: [{ node: normal_dmg_ }],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
