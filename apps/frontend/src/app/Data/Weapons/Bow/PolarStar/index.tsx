import { input } from '../../../../Formula'
import { lookup, naught, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'PolarStar'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)
const eleSrc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const ashenStack1 = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const ashenStack2 = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const ashenStack3 = [-1, 0.3, 0.375, 0.45, 0.528, 0.6]
const ashenStack4 = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]

const [condPassivePath, condPassive] = cond(key, 'GoldenMajesty')

const skill_dmg_ = subscript(input.weapon.refinement, eleSrc)
const burst_dmg_ = subscript(input.weapon.refinement, eleSrc)
const atk_ = lookup(
  condPassive,
  {
    '1': subscript(input.weapon.refinement, ashenStack1),
    '2': subscript(input.weapon.refinement, ashenStack2),
    '3': subscript(input.weapon.refinement, ashenStack3),
    '4': subscript(input.weapon.refinement, ashenStack4),
  },
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    burst_dmg_,
    atk_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: skill_dmg_,
        },
        {
          node: burst_dmg_,
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objKeyMap(range(1, 4), (i) => ({
        name: st('stack', { count: i }),
        fields: [
          {
            node: atk_,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
