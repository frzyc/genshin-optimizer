import { input } from '../../../../Formula'
import { lookup, naught, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'ThunderingPulse'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atkSrc = [0.2, 0.25, 0.3, 0.35, 0.4]
const naStack1 = [0.12, 0.15, 0.18, 0.21, 0.24]
const naStack2 = [0.24, 0.3, 0.36, 0.42, 0.48]
const naStack3 = [0.4, 0.5, 0.6, 0.7, 0.8]

const [condPassivePath, condPassive] = cond(key, 'RuleByThunder')
const atk_ = subscript(input.weapon.refineIndex, atkSrc)
const normal_dmg_ = lookup(
  condPassive,
  {
    '1': subscript(input.weapon.refineIndex, naStack1),
    '2': subscript(input.weapon.refineIndex, naStack2),
    '3': subscript(input.weapon.refineIndex, naStack3),
  },
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    normal_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk_,
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objectKeyMap(range(1, 3), (i) => ({
        name: st('stack', { count: i }),
        fields: [
          {
            node: normal_dmg_,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
