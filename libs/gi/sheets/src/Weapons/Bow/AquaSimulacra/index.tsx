import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'AquaSimulacra'
const [, trm] = trans('weapon', key)

const hp_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const dmg_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const [condPassivePath, condPassive] = cond(key, 'passive')

const base_hp_ = subscript(input.weapon.refinement, hp_arr)
const cond_dmg_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, dmg_arr),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    hp_: base_hp_,
    all_dmg_: cond_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: base_hp_,
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: cond_dmg_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
