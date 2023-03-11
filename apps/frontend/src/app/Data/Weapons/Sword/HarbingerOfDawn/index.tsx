import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'HarbingerOfDawn'
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, 'SkyPiercingMight')
const critRateSrc_ = [0.14, 0.175, 0.21, 0.245, 0.28]
const critRate_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refineIndex, critRateSrc_)
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
