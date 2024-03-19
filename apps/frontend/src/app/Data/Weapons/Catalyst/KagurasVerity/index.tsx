import { range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import { equal, subscript, sum } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'KagurasVerity'
const data_gen = allStats.weapon.data[key]

const [condPath, condNode] = cond(key, 'KaguraDance')
const totems = range(1, 3)
const dmg_ = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const skill_dmg_s = totems.map((i) =>
  equal(
    condNode,
    i.toString(),
    subscript(
      input.weapon.refinement,
      dmg_.map((d) => d * i)
    ),
    KeyMap.info('skill_dmg_')
  )
)
const ele_dmg_s = Object.fromEntries(
  allElementKeys.map((ele) => [
    ele,
    equal(condNode, '3', subscript(input.weapon.refinement, dmg_)),
  ])
)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_: sum(...skill_dmg_s),
    ...Object.fromEntries(
      allElementKeys.map((ele) => [`${ele}_dmg_`, ele_dmg_s[ele]])
    ),
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condNode,
      path: condPath,
      header: headerTemplate(key, st('stacks')),
      name: st('afterUse.skill'),
      states: Object.fromEntries(
        totems.map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [
              {
                node: skill_dmg_s[i - 1],
              },
              ...allElementKeys.map((ele) => ({ node: ele_dmg_s[ele] })),
            ],
          },
        ])
      ),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
