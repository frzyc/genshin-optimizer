import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TheAlleyFlash'
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'ItinerantHero')
const bonusInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const all_dmg_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, bonusInc, { unit: '%' }),
)

const data = dataObjForWeaponSheet(key, {
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
export default new WeaponSheet(sheet, data)
