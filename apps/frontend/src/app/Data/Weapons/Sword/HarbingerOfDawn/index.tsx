import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'HarbingerOfDawn'
const data_gen = allStats.weapon.data[key]

const [condPassivePath, condPassive] = cond(key, 'SkyPiercingMight')
const critRateSrc_ = [-1, 0.14, 0.175, 0.21, 0.245, 0.28]
const critRate_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, critRateSrc_)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critRate_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('greaterPercentHP', { percent: 90 }),
      states: {
        on: {
          fields: [
            {
              node: critRate_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
