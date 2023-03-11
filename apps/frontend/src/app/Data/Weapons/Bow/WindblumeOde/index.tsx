import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'WindblumeOde'
const data_gen = data_gen_json as WeaponData

const atk_s = [0.16, 0.2, 0.24, 0.28, 0.32]
const [condPassivePath, condPassive] = cond(key, 'WindblumeWish')
const atk_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refineIndex, atk_s)
)

const data = dataObjForWeaponSheet(key, data_gen, {
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

export default new WeaponSheet(key, sheet, data_gen, data)
