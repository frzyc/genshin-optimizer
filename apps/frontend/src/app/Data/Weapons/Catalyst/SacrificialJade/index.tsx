import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SacrificialJade'
const data_gen = allStats.weapon.data[key]

const hp_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const eleMasArr = [-1, 80, 100, 120, 140, 160]

const [condOffFieldPath, condOffField] = cond(key, 'offField')
const hp_ = equal(
  condOffField,
  'on',
  subscript(input.weapon.refinement, hp_arr)
)
const eleMas = equal(
  condOffField,
  'on',
  subscript(input.weapon.refinement, eleMasArr)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas,
    hp_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      path: condOffFieldPath,
      value: condOffField,
      name: st('charOffField'),
      states: {
        on: {
          fields: [
            {
              node: hp_,
            },
            {
              node: eleMas,
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
