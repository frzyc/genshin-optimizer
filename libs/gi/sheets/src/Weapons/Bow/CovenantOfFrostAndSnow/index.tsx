import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'CovenantOfFrostAndSnow'

const [condPassivePath, condPassive] = cond(key, 'passive')
const eleMasArr = [-1, 120, 150, 180, 210, 240]
const eleMas = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, eleMasArr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: eleMas,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
