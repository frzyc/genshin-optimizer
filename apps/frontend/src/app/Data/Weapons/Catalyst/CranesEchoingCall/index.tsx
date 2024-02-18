import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'

import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'CranesEchoingCall'
const data_gen = allStats.weapon.data[key]

const plunging_dmg_arr = [-1, 0.28, 0.41, 0.54, 0.67, 0.8]

const [condPassivePath, condPassive] = cond(key, 'passive')
const plunging_dmg_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, plunging_dmg_arr, { unit: '%' })
)

const data = dataObjForWeaponSheet(key, data_gen, {
  teamBuff: {
    premod: {
      plunging_dmg_,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.plunging'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: plunging_dmg_,
            },
            {
              text: stg('duration'),
              value: 20,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
