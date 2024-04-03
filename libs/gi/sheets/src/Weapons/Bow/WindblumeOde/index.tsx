import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'WindblumeOde'

const atk_s = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const [condPassivePath, condPassive] = cond(key, 'WindblumeWish')
const atk_ = equal(condPassive, 'on', subscript(input.weapon.refinement, atk_s))

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
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
