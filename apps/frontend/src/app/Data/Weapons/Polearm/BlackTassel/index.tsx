import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'BlackTassel'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)

const dmgInc = [0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, 'PressTheAdvantage')
const all_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refineIndex, dmgInc)
)
const data = dataObjForWeaponSheet(key, data_gen, {
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
export default new WeaponSheet(key, sheet, data_gen, data)
