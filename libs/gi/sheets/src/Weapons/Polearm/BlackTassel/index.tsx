import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'BlackTassel'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const dmgInc = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, 'PressTheAdvantage')
const all_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, dmgInc)
)
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: all_dmg_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
