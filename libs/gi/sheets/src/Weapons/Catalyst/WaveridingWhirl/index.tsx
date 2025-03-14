import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  min,
  prod,
  subscript,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'WaveridingWhirl'

const hpArr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const hpPerTeammateArr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const [condPassivePath, condPassive] = cond(key, 'passive')
const hp_ = equal(
  'on',
  condPassive,
  sum(
    subscript(input.weapon.refinement, hpArr, { unit: '%' }),
    prod(
      subscript(input.weapon.refinement, hpPerTeammateArr, { unit: '%' }),
      min(tally.hydro, 2),
    ),
  ),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    hp_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: st('afterUse.skill'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: hp_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 15,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
