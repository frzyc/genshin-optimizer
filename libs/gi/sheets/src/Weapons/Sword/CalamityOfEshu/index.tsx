import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'CalamityOfEshu'

const dmg_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const critRate_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const [condPassivePath, condPassive] = cond(key, 'passive')
const normal_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, dmg_arr, { unit: '%' }),
)
const charged_dmg_ = { ...normal_dmg_ }
const normal_critRate_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, critRate_arr, { unit: '%' }),
)
const charged_critRate_ = { ...normal_critRate_ }

const data = dataObjForWeaponSheet(key, {
  premod: {
    normal_dmg_,
    charged_dmg_,
    normal_critRate_,
    charged_critRate_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: st('protectedByShield'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: normal_dmg_,
            },
            {
              node: charged_dmg_,
            },
            {
              node: normal_critRate_,
            },
            {
              node: charged_critRate_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
