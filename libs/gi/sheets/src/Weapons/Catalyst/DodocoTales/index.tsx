import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'DodocoTales'

const chargedDmgInc = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const atkInc = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const [condNormalPath, condNormal] = cond(key, 'DodoventureNormal')
const [condChargedPath, condCharged] = cond(key, 'DodoventureCharged')
const charged_dmg_ = equal(
  'on',
  condNormal,
  subscript(input.weapon.refinement, chargedDmgInc),
)
const atk_ = equal(
  'on',
  condCharged,
  subscript(input.weapon.refinement, atkInc),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    charged_dmg_,
    atk_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condNormal,
      path: condNormalPath,
      name: st('hitOp.normal'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: charged_dmg_,
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
    {
      value: condCharged,
      path: condChargedPath,
      name: st('hitOp.charged'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: atk_,
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
export default new WeaponSheet(sheet, data)
